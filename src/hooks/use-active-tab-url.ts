import { useState, useEffect } from 'react';
import chromeApi from '../background/dev-tools-api';

export function useActiveTabUrl() {
  const [data, setData] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const activeTab = await chromeApi.getActiveTab();
      setData(activeTab?.url);
    })();
  });

  return data;
}
