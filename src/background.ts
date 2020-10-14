/* eslint-disable no-undef */
import { browser, WebRequest } from 'webextension-polyfill-ts';

import { DEBUGGER_VERSION } from './common/constants';
import { DomainConfig } from './types/domain-config';

let configMap: { domains?: { [host: string]: DomainConfig } } = {};

browser.storage.local.get().then((value) => {
  if (value) {
    configMap = value;
  }
});

browser.storage.onChanged.addListener(() => {
  browser.storage.local.get().then((value) => {
    configMap = value;
  });
});

function requestInteceptor({ requestHeaders = [], initiator = '' }: WebRequest.OnBeforeSendHeadersDetailsType & { initiator?: string}) {
  const requestHost = getHost(initiator);

  if (!requestHost) {
    return { requestHeaders };
  }

  const { sessionId = '', testName = '', isActive = false } = configMap.domains ? configMap.domains[requestHost] || {} : {};
  if (isActive) {
    requestHeaders.push({ name: 'drill-session-id', value: sessionId });
    requestHeaders.push({ name: 'drill-test-name', value: testName });
  }
  return { requestHeaders };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  requestInteceptor,
  {
    urls: ['*://*/*'],
  },
  ['blocking', 'requestHeaders'],
);

browser.webRequest.onHeadersReceived.addListener(
  responseInterceptor,
  {
    urls: ['*://*/*'],
  },
  ['responseHeaders'],
);

const DRILL_RESPONSE_HEADERS = ['drill-group-id', 'drill-agent-id', 'drill-admin-url'];

function responseInterceptor({ responseHeaders = [], initiator = '' }: WebRequest.OnHeadersReceivedDetailsType & { initiator?: string }) {
  const drillHeaders = responseHeaders.filter(
    ({ name }) => DRILL_RESPONSE_HEADERS.includes(name.toLowerCase()),
  ).reduce((acc, { name, value }) => ({ ...acc, [toCamel(name.toLowerCase())]: value }), {});

  Object.keys(drillHeaders).length && storeConfig(getHost(initiator), drillHeaders);
}

async function storeConfig(host: string, config: { [key: string]: string }) {
  const { domains } = await browser.storage.local.get('domains');
  const { [host]: currentConfig } = domains || {};

  if (!currentConfig || (!currentConfig.custom && !compareConfigs(currentConfig, config))) {
    browser.storage.local.set({
      domains: { ...domains, [host]: { ...config, drillAdminUrl: `http://${config.drillAdminUrl}` } },
    });
  }
}

function compareConfigs({ drillAgentId, drillGroupId, drillAdminUrl }: DomainConfig, newConfig: DomainConfig) {
  const { drillAgentId: agentId, drillGroupId: groupId, drillAdminUrl: adminUrl } = newConfig;
  return (drillAgentId === agentId || drillGroupId === groupId) && drillAdminUrl === `http://${adminUrl}`;
}

const toCamel = (srt: string) => srt.replace(/([-_][a-z])/ig, ($match) => $match.toUpperCase()
  .replace('-', ''));

const getHost = (url: string) => {
  try {
    return new URL(url).host;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Exception while getting host ${error.message}`);
    return '';
  }
};

browser.runtime.onMessage.addListener((request: any, sender: any) => {
  if (request.action === 'START_TEST') {
    startTest(sender.tab); // TODO why not return
  }

  if (request.action === 'FINISH_TEST') {
    return Promise.resolve(stopTest(sender.tab));
  }

  if (request.action === 'IS_JS_RECORDING_IN_PROGRESS') {
    return Promise.resolve(isJsRecordingInProgress);
  }

  return Promise.resolve(true);
});

const asPromised = (block: any) => new Promise((resolve, reject) => {
  block((...results: any[]) => {
    if (browser.runtime.lastError) {
      reject(browser.extension.lastError);
    } else {
      resolve(...results);
    }
  });
});

const devTools = {
  attach(target: any) {
    return asPromised((callback: any) => {
      chrome.debugger.attach(target, DEBUGGER_VERSION, callback);
    });
  },

  sendCommand(target: any, method: any, params: any) {
    return asPromised((callback: any) => {
      chrome.debugger.sendCommand(target, method, params, callback);
    });
  },

  detach(target: any) {
    return asPromised((callback: any) => {
      chrome.debugger.detach(target, callback);
    });
  },
};

const scriptSources: any = {};
let isJsRecordingInProgress = false;

const startTest = async (tab: any) => {
  try {
    const target = {
      tabId: tab.id,
    };

    await devTools.attach(target);

    await devTools.sendCommand(target, 'Profiler.enable', {});
    await devTools.sendCommand(target, 'Profiler.startPreciseCoverage', {
      callCount: false,
      detailed: true,
    });
    isJsRecordingInProgress = true;

    chrome.debugger.onEvent.addListener(async (source, method, params) => {
      if (method !== 'Debugger.scriptParsed') {
        return;
      }

      const { url, scriptId } = params as { url: string; scriptId: string };

      if (!url || url.startsWith('chrome-extension:') || url.includes('google-analytics.com')) {
        return;
      }

      const rawScriptSource: any = await devTools.sendCommand(target, 'Debugger.getScriptSource', { scriptId });

      scriptSources[url] = {
        id: scriptId,
        source: rawScriptSource.scriptSource,
      };
    });

    await devTools.sendCommand(target, 'Debugger.enable', {});
    await devTools.sendCommand(target, 'Debugger.setSkipAllPauses', { skip: true });
  } catch (e) {
    isJsRecordingInProgress = false;
  }
};

const stopTest = async (tab: any) => {
  const target = {
    tabId: tab.id,
  };

  const data: any = await devTools.sendCommand(target, 'Profiler.takePreciseCoverage', {});
  await devTools.sendCommand(target, 'Profiler.stopPreciseCoverage', {});
  await devTools.sendCommand(target, 'Profiler.disable', {});
  await devTools.sendCommand(target, 'Debugger.disable', {});

  await devTools.detach(target);

  isJsRecordingInProgress = false;
  return { coverage: data.result, scriptSources };
};
