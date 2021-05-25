import { useState, useEffect } from 'react';
import * as localStorageUtil from '../common/util/local-storage';

export function useLocalStorageGet(key: string) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const value = await localStorageUtil.get(key);
      setData(value[key]);
    })();
  }, [key]);

  return data;
}
