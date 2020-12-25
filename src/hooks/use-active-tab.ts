import { useState, useEffect } from 'react';
import chromeApi from '../common/chrome-api';

export function useActiveTab() {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const data = await chromeApi.getActiveTab();
      setActiveTab(data);
    })();
  });

  return activeTab;
}
