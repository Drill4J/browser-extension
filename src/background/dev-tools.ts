import { browser } from 'webextension-polyfill-ts';
import { DEBUGGER_VERSION } from '../common/constants';

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
      // eslint-disable-next-line no-undef
      chrome.debugger.attach(target, DEBUGGER_VERSION, callback);
    });
  },

  sendCommand(target: any, method: any, params: any) {
    return asPromised((callback: any) => {
      // eslint-disable-next-line no-undef
      chrome.debugger.sendCommand(target, method, params, callback);
    });
  },

  detach(target: any) {
    return asPromised((callback: any) => {
      // eslint-disable-next-line no-undef
      chrome.debugger.detach(target, callback);
    });
  },
};

export default devTools;
