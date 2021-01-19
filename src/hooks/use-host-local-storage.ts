import { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

export function useHostLocalStorage(host: string) {
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (host) {
      run();
      if (browser.storage.onChanged.hasListener(handleHostStorageChange(host))) {
        browser.storage.onChanged.removeListener(handleHostStorageChange(host));
      }
      browser.storage.onChanged.addListener(handleHostStorageChange(host));
    }

    async function run() {
      setData(await browser.storage.local.get(host));
    }

    function handleHostStorageChange(hostName: string) {
      return async (changes: { [s: string]: chrome.storage.StorageChange }) => {

        if (changes[hostName] && changes[hostName].newValue) {
          await run();
          // setData({ [hostName]: changes[hostName].newValue });
        }

        // isWidgetVisible
        // isWidgetExpanded
        // if (typeof key === 'string') {
        //   changes && Object.keys(changes).includes(key) && handleSetData();
        // } else if (changes && key.filter(value => Object.keys(changes).includes(value)).length) {
        //   handleSetData();
        // }
      };
    }
  }, [host]);

  return data;
}
