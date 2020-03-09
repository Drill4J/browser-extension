import { useState, useEffect } from 'react';

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
