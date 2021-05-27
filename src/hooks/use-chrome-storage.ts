import { useEffect, useState } from 'react';
import { getStorage, addToStorage } from '../common/util/local-storage';

export const useChromeStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const handleStateChange = (changes: { [key: string]: chrome.storage.StorageChange }) => setStoredValue(changes[key].newValue);

    chrome.storage.onChanged.addListener(handleStateChange);
    const storageValue = getStorage([key]);
    storageValue.then((result) => {
      if (result && result[key] !== undefined) {
        setStoredValue(result[key]);
      } else {
        addToStorage({ [key]: initialValue });
      }
    });

    return () => chrome.storage.onChanged.removeListener(handleStateChange);
  }, []);

  const setValue = (value: T) => {
    setStoredValue(value);
    addToStorage({ [key]: value });
  };

  return [storedValue, setValue] as const;
};
