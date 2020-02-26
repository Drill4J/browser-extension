import { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { AgentConfig } from '../types/agent-config';

export function useAgentConfig() {
  const [data, setData] = useState<AgentConfig | null>(null);

  useEffect(() => {
    const { host } = window.location;
    browser.storage.local.get(host).then(({ [host]: agentConfig }) => {
      setData(agentConfig as AgentConfig);
    });
  }, []);

  return data;
}
