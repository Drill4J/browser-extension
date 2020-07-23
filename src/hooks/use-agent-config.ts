import { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { DomainConfig } from '../types/domain-config';

export function useAgentConfig() {
  const [data, setData] = useState<DomainConfig | null>(null);

  useEffect(() => {
    const { host } = window.location;
    browser.storage.local.get('domains').then(({ domains: { [host]: agentConfig } }) => {
      setData(agentConfig as DomainConfig);
    });
  }, []);

  return data;
}
