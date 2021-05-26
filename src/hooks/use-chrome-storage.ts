import { useEffect, useState } from 'react';

export const useChromeStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const handleStateChange = (changes: { [key: string]: chrome.storage.StorageChange }) => setStoredValue(changes[key].newValue);

    chrome.storage.onChanged.addListener(handleStateChange);
    chrome.storage.local.get([key], result => {
      if (result && result[key] !== undefined) {
        setStoredValue(result[key]);
      } else {
        chrome.storage.local.set({ [key]: initialValue });
      }
    });

    return () => chrome.storage.onChanged.removeListener(handleStateChange);
  }, []);

  const setValue = (value: T) => {
    setStoredValue(value);
    chrome.storage.local.set({ [key]: value });
  };

  return [storedValue, setValue] as const;
};
