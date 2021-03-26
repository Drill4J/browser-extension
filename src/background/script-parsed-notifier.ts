import chromeApi from '../common/chrome-api';
import devToolsApi from './dev-tools-api';

interface Subscribers {
  [key: string]: {
    [key: number]: Array<any>;
  };
}

const subscribers: Subscribers = {};
console.log(subscribers);

chrome.debugger.onEvent.addListener(async (source: any, method: string, params: Record<string, any> | undefined) => {
  if (method !== 'Debugger.scriptParsed') return;
  const { url: scriptUrl, scriptId } = params as { url: string; scriptId: string };
  if (!scriptUrl
    || scriptUrl.startsWith('chrome-extension:')
    || scriptUrl.includes('google-analytics.com')
    || scriptUrl.includes('node_modules')) return;

  let scriptSource: string;
  try {
    scriptSource = (await devToolsApi.sendCommand({ tabId: source.tabId }, 'Debugger.getScriptSource', { scriptId }) as any).scriptSource;
  } catch (e) {
    console.log(`%cWARNING%c: scriptId ${scriptId} getScriptSource(...) failed: ${e?.message || JSON.stringify(e)}`,
      'background-color: yellow;',
      'background-color: unset;');
    return;
  }

  const script = { scriptSource, scriptUrl };
  const tab = await chromeApi.getTabById(source.tabId);
  if (!tab?.url) {
    console.log(`%cWARNING%c: tab with id ${source.tabId} not found`,
      'background-color: yellow;',
      'background-color: unset;');
    return;
  }
  subscribers[tab.url][source.tabId].forEach((callback: any) => { callback({ script, tab }); });
});

export function subscribe(url: any, tabId: any, callback: any) {
  if (!subscribers[url]) subscribers[url] = { [tabId]: [] };
  const index = subscribers[url][tabId].push(callback) - 1;
  subscribers[url][tabId].push(callback);

  return () => {
    subscribers[url][tabId].splice(index, 1);
  };
}
