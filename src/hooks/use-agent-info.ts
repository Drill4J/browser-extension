import { useState, useEffect } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { getDefaultAdminSocket } from '../common/connection';
import { useLocalStorage } from './use-local-storage';
import { Agent } from '../types/agent';

export function useAgentInfo(adminUrl?: string, agentId?: string) {
  const { token = '' } = useLocalStorage<string>('token') || {};
  const [data, setData] = useState<Agent | null>(null);

  useEffect(
    () => {
      function handleDataChange(newData: Agent) {
        setData(newData);
        browser.storage.local.set({ agent: newData });
      }

      const unsubscribe = agentId && adminUrl
        ? getDefaultAdminSocket(adminUrl, token).subscribe(
          `/agents/${agentId}`,
          handleDataChange,
        )
        : null;

      return () => {
        unsubscribe && unsubscribe();
      };
    },
    [adminUrl, agentId, token],
  );

  return data;
}
