import { browser } from 'webextension-polyfill-ts';

let isActive = false;
let testName = 'test';
let sessionId = '';

browser.storage.local.get(['isActive', 'testName', 'sessionId']).then((value) => {
  isActive = value.isActive;
  testName = value.testName;
  sessionId = value.sessionId;
});

browser.storage.onChanged.addListener(
  ({
    isActive: { newValue: newIsActiveValue = '' } = {},
    testName: { newValue: newTestName = '' } = {},
    sessionId: { newValue: newSessionId = '' } = {},
  }) => {
    isActive = newIsActiveValue;
    testName = newTestName;
    sessionId = newSessionId;
  },
);

function rewriteUserAgentHeader({ requestHeaders }: { requestHeaders?: any }) {
  if (isActive) {
    requestHeaders.push({ name: 'drill-session-id', value: sessionId });
    requestHeaders.push({ name: 'drill-test-name', value: testName });
  }
  return { requestHeaders };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  rewriteUserAgentHeader,
  {
    urls: ['http://localhost/*', 'http://*.epam.com/*'],
  },
  ['blocking', 'requestHeaders'],
);
