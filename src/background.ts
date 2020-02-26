import { browser, WebRequest } from 'webextension-polyfill-ts';

import { AgentConfig } from 'types/agent-config';

let configMap: { [host: string]: AgentConfig } = {};

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

function requestInteceptor({ requestHeaders = [], url }: WebRequest.OnBeforeSendHeadersDetailsType) {
  const requestHost = getHost(url);
  const { sessionId, testName, isActive } = configMap[requestHost];
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

const DRILL_REQUEST_HEADER = ['drill-session-id', 'drill-test-name'];

function responseInterceptor({ responseHeaders = [], url }: WebRequest.OnHeadersReceivedDetailsType) {
  const drillHeaders = responseHeaders.filter(
    ({ name }) => DRILL_RESPONSE_HEADERS.includes(name),
  ).reduce((acc, { name, value }) => ({ ...acc, [toCamel(name)]: value }), {});

  Object.keys(drillHeaders).length && storeConfig(getHost(url), drillHeaders);
}

async function storeConfig(host: string, config?: { [key: string]: string | undefined }) {
  const { [host]: currentConfig } = await browser.storage.local.get([host]);
  if (!currentConfig) {
    browser.storage.local.set({
      [host]: { ...config },
    });
  }
}

const toCamel = (srt: string) => srt.replace(/([-_][a-z])/ig, ($match) => $match.toUpperCase()
  .replace('-', ''));

const getHost = (url: string) => new URL(url).host;
