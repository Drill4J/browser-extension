import { useState, useEffect } from 'react';

import { getDefaultPluginSocket } from '../common/connection';
import { useLocalStorage } from './use-local-storage';
import { Agent } from '../types/agent';

export function useBuildCoverage(adminUrl?: string) {
  const { token = '' } = useLocalStorage<any>('token') || {};
  const { agent: { id = '', buildVersion = '' } = {} } = useLocalStorage<any>('agent') || {};
  const [data, setData] = useState<Agent | null>(null);

  useEffect(
    () => {
      function handleDataChange(newData: Agent) {
        setData(newData);
      }

      const unsubscribe = id && adminUrl
        ? getDefaultPluginSocket(adminUrl, token).subscribe(
          '/build/coverage',
          handleDataChange,
          { agentId: id, buildVersion },
        )
        : null;

      return () => {
        unsubscribe && unsubscribe();
      };
    },
    [adminUrl, id, token, buildVersion],
  );

  return data;
}
