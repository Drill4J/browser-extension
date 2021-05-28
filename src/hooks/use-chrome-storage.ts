import { useEffect, useState } from 'react';
import { getStorage, addToStorage } from '../common/util/local-storage';

export const useChromeStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const handleStateChange = (changes: { [key: string]: chrome.storage.StorageChange }) => setStoredValue(changes[key].newValue);

    chrome.storage.onChanged.addListener(handleStateChange);

    (async () => {
      const storageValue = await getStorage([key]);
      if (storageValue && storageValue[key] !== undefined) {
        setStoredValue(storageValue[key]);
      } else {
        await addToStorage({ [key]: initialValue });
      }
    })();

    return () => chrome.storage.onChanged.removeListener(handleStateChange);
  }, []);

  const setValue = async (value: T) => {
    await addToStorage({ [key]: value });
    setStoredValue(value);
  };

  return [storedValue, setValue] as const;
};
