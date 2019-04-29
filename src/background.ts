import { browser } from 'webextension-polyfill-ts';

let id = '';
let isActive = browser.storage.local.get().then((value) => value.isActive);

browser.runtime.onMessage.addListener(async (msg, { id: extensionId }) => {
  id = extensionId;
  const { isActive: state } = await browser.storage.local.get();
  isActive = state;
});

function rewriteUserAgentHeader(e: any) {
  if (isActive) {
    e.requestHeaders.push({ name: 'drillSessionId', value: id });
  }

  return { requestHeaders: e.requestHeaders };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  rewriteUserAgentHeader,
  { urls: ['<all_urls>'] },
  ['blocking', 'requestHeaders'],
);
