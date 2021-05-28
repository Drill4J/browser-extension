import { promisifyChromeApiCall } from '../util/promisify-chrome-api-call';

export default {
  async getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
    const tabs = await promisifyChromeApiCall((cb) => chrome.tabs.query({ active: true, currentWindow: true }, cb));
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return undefined;
    }
    return tabs[0];
  },
};
