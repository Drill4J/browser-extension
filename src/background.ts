import { browser, WebRequest } from 'webextension-polyfill-ts';

import { AgentConfig } from './types/agent-config';

let activeTab = '';
let config: AgentConfig = {};

browser.tabs.onActivated.addListener(({ tabId }) => {
  browser.tabs.get(tabId).then(({ url = '' }) => {
    const { host } = new URL(url);
    activeTab = host;

    browser.storage.local.get(host).then(({ [host]: value = {} }) => {
      config = value;
    });
  });
});

browser.storage.local.get(activeTab).then((value) => {
  if (value) {
    config = value;
  }
});

browser.storage.onChanged.addListener(({ [activeTab]: { newValue = '' } = {} }) => {
  if (newValue) {
    config = newValue;
  }
});

function addDrillHeaders({ requestHeaders = [] }: WebRequest.OnBeforeSendHeadersDetailsType) {
  if (config.isActive) {
    requestHeaders.push({ name: 'drill-session-id', value: config.sessionId });
    requestHeaders.push({ name: 'drill-test-name', value: config.testName });
  }
  return { requestHeaders };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  addDrillHeaders,
  {
    urls: ['*://*/*'],
  },
  ['blocking', 'requestHeaders'],
);

function checkDrillAgentId({ responseHeaders = [] }: WebRequest.OnHeadersReceivedDetailsType) {
  const { value: adminUrl = '' } = responseHeaders.find((header) => header.name.toLowerCase() === 'drill-admin-url') || {};
  const { value: agentId = '' } = responseHeaders.find((header) => header.name.toLowerCase() === 'drill-agent-id') || {};
  const { value: groupId = '' } = responseHeaders.find((header) => header.name.toLowerCase() === 'drill-group-id') || {};
  if (adminUrl && (agentId || groupId)) {
    const url = new URL(`https://${activeTab}`).host;
    browser.storage.local.get([url]).then(({ [url]: currentConfig }) => {
      browser.storage.local.set({
        [url]: {
          ...currentConfig,
          adminUrl,
          agentId,
          groupId,
        },
      });
    });
  }
}

browser.webRequest.onHeadersReceived.addListener(
  checkDrillAgentId,
  {
    urls: ['*://*/*'],
  },
  ['responseHeaders'],
);

browser.webRequest.onHeadersReceived.addListener(
  responseInterceptor,
  {
    urls: ['*://*/*'],
  },
  ['responseHeaders'],
);

const drillHeaders = ['drill-group-id', 'drill-agent-id', 'drill-admin-url'];

function responseInterceptor({ responseHeaders = [] }: WebRequest.OnHeadersReceivedDetailsType) {
  const filtredHeaders = responseHeaders.filter(
    ({ name }) => drillHeaders.includes(name),
  ).map(({ name, value }) => ({ [toCamel(name)]: value }));
}

const toCamel = (srt: string) => srt.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase()
  .replace('-', ''));
