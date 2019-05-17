import { browser } from 'webextension-polyfill-ts';

let isActive = false;
let testName = 'test';

browser.storage.local.get(['isActive', 'testName']).then((value) => {
  isActive = value.isActive;
  testName = value.testName;
});

browser.storage.onChanged.addListener(
  ({
    isActive: { newValue: newIsActiveValue = '' } = {},
    testName: { newValue: newTestName = '' } = {},
  }) => {
    isActive = newIsActiveValue;
    testName = newTestName;
  },
);

function rewriteUserAgentHeader({ requestHeaders }: { requestHeaders?: any }) {
  if (isActive) {
    requestHeaders.push({ name: 'drill-session-id', value: browser.runtime.id });
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
