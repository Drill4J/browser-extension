import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

export function useLocalStorage(key) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function handleSetData() {
      setData(await browser.storage.local.get(key));
    }

    handleSetData();
  }, []);

  return data;
}
