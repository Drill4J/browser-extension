import { browser } from 'webextension-polyfill-ts';

const DEBUGGER_VERSION = '1.3';

// TODO type it!
// type Callback = (...results: unknown[]) => void;
// type ApiFunction<T extends unknown[], U> = (...params: [...T, U]) => void
// function promisifyBrowserAPICall<T extends unknown[]>(apiFunction: ApiFunction<T, Callback>, ...params: unknown[]) {

function promisifyBrowserAPICall(apiFunction: any, ...params: unknown[]) {
  return new Promise((resolve, reject) => {
    apiFunction(...params, (...results: any[]) => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve(...results);
      }
    });
  });
}

export default {
  attach(target: chrome.debugger.Debuggee) {
    return promisifyBrowserAPICall(chrome.debugger.attach, target, DEBUGGER_VERSION);
  },

  sendCommand(target: chrome.debugger.Debuggee, method: string, params: any) {
    return promisifyBrowserAPICall(chrome.debugger.sendCommand, target, method, params);
  },

  detach(target: chrome.debugger.Debuggee) {
    return promisifyBrowserAPICall(chrome.debugger.detach, target);
  },

  // TODO either rename file to browserAPI or move function to separate file
  async getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
    const tabs = await promisifyBrowserAPICall(chrome.tabs.query, { active: true });
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return undefined;
    }
    return tabs[0];
  },
};
