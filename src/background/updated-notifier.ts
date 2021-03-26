const subscribers: any = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(tab, subscribers);
  subscribers[tab.url as any][tabId].forEach(((callback: any) => callback()));
});

export const subscribe = (url: string, tabId: number, callback: () => void) => {
  if (!subscribers[url]) subscribers[url] = { [tabId]: [] };
  subscribers[url][tabId].push(callback);
  return () => {
    subscribers[url][tabId].splice(subscribers[url][tabId].findIndex((x: any) => x === callback), 1);
  };
};
