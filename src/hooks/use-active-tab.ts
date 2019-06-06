import { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

export function useActiveTab() {
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([{ url = '' }]) => {
      const hostname = new URL(url).hostname;
      setActiveTab(hostname);
    });
  }, []);

  return activeTab;
}
