import browser from 'webextension-polyfill';

export function sendMessageToTab(message, data) {
  browser.tabs.query({
    active: true,
    currentWindow: true,
  }).then((tabs) => browser.tabs.sendMessage(tabs[0].id, { message, data }));
}

export function addMessageListener(listener) {
  browser.runtime.onMessage.addListener(listener)
}

export function removeMessageListener(listener) {
  browser.runtime.onMessage.removeListener(listener)
}
