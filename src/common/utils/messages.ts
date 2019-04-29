import { browser } from 'webextension-polyfill-ts';

export function sendMessageToTab(message: any, data?: any) {
  browser.tabs
    .query({
      active: true,
      currentWindow: true,
    })
    .then((tabs) => browser.tabs.sendMessage(tabs[0].id, { message, data }));
}

export function addMessageListener(listener: any) {
  browser.runtime.onMessage.addListener(listener);
}

export function removeMessageListener(listener: any) {
  browser.runtime.onMessage.removeListener(listener);
}
