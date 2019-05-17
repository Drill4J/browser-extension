import { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

export function useLocalStorage(key: string | string[]) {
  const [data, setData] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    async function handleSetData() {
      setData(await browser.storage.local.get(key));
    }

    handleSetData();
  }, []);

  return data;
}
