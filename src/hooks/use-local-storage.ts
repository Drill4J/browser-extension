import { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

export function useLocalStorage<T>(key: string | string[]) {
  const [data, setData] = useState<{ [key: string]: T } | null>(null);

  useEffect(() => {
    async function handleSetData() {
      setData(await browser.storage.local.get(key));
    }

    browser.storage.onChanged.addListener((changes) => {
      if (typeof key === 'string') {
        changes && Object.keys(changes).includes(key) && handleSetData();
      } else if (changes && key.filter(value => Object.keys(changes).includes(value)).length) {
        handleSetData();
      }
    });

    handleSetData();
  }, []);

  return data;
}
