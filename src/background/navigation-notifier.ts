interface Subscribers {
  [key: string]: {
    [key: number]: Array<() => void>;
  };
}

const subscribers: Subscribers = {};

chrome.webNavigation.onBeforeNavigate.addListener(({ tabId, url }) => { subscribers[url][tabId].forEach((callback => callback())); });

export function subscribe(url: string, tabId: number, callback: () => void) {
  if (!subscribers[url]) subscribers[url] = { [tabId]: [] };
  subscribers[url][tabId].push(callback);

  return () => {
    subscribers[url][tabId].splice(subscribers[url][tabId].findIndex((x: any) => x === callback), 1);
  };
}
