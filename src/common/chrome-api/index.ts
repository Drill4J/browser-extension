import { promisifyBrowserApiCall } from '../util/promisify-browser-api-call';

export default {
  async getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
    const tabs = await promisifyBrowserApiCall(chrome.tabs.query, { active: true, currentWindow: true });
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return undefined;
    }
    return tabs[0];
  },
  async getTabById(tabId: number): Promise<chrome.tabs.Tab | undefined> {
    const tab = await promisifyBrowserApiCall<chrome.tabs.Tab>(chrome.tabs.get, tabId);
    return tab;
  },
};
