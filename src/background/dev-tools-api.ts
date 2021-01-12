import { promisifyBrowserApiCall } from '../common/util/promisify-browser-api-call';

const DEBUGGER_VERSION = '1.3';

export default {
  attach(target: chrome.debugger.Debuggee) {
    return promisifyBrowserApiCall(chrome.debugger.attach, target, DEBUGGER_VERSION);
  },

  sendCommand(target: chrome.debugger.Debuggee, method: string, params: any) {
    return promisifyBrowserApiCall(chrome.debugger.sendCommand, target, method, params);
  },

  detach(target: chrome.debugger.Debuggee) {
    return promisifyBrowserApiCall(chrome.debugger.detach, target);
  },

};
