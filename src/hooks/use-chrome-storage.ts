import { useState } from 'react';

export const useChromeStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // https://developer.chrome.com/docs/extensions/reference/storage/
    // I think it may be more profitable to use chrome.storage.SYNC
    chrome.storage.local.get([key], result => {
      if (result && result[key] !== undefined) {
        setStoredValue(result[key]);
      } else {
        chrome.storage.local.set({ [key]: initialValue });
      }
    });
    return initialValue;
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    chrome.storage.local.set({ [key]: value });
  };

  return [storedValue, setValue] as const;
};
