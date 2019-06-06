import { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { AgentConfig } from '../types/agent-config';

export function useAgentConfig() {
  const [data, setData] = useState<AgentConfig | null>(null);

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([{ url = '' }]) => {
      const hostname = new URL(url).hostname;
      browser.storage.local.get(hostname).then(({ [hostname]: agentConfig }) => {
        setData(agentConfig as AgentConfig);
      });
    });
  }, []);

  return data;
}
