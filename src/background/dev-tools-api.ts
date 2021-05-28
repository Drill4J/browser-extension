import { promisifyChromeApiCall } from '../common/util/promisify-chrome-api-call';

const DEBUGGER_VERSION = '1.3';

export default {
  attach(target: chrome.debugger.Debuggee) {
    return promisifyChromeApiCall((cb) => chrome.debugger.attach(target, DEBUGGER_VERSION, cb));
  },

  sendCommand(target: chrome.debugger.Debuggee, method: string, params: any) {
    return promisifyChromeApiCall((cb) => chrome.debugger.sendCommand(target, method, params, cb));
  },

  detach(target: chrome.debugger.Debuggee) {
    return promisifyChromeApiCall((cb) => chrome.debugger.detach(target, cb));
  },

};
