import { useState, useEffect } from 'react';
import { getDefaultTest2CodeSocket } from '../common/connection';
import { useLocalStorage } from './use-local-storage';
import { Agent } from '../types/agent';

export function useActiveScope(adminUrl?: string) {
  throw new Error('DEPRECATED');
  const { token = '' } = useLocalStorage<any>('token') || {};
  const { agent: { id = '', buildVersion = '' } = {} } = useLocalStorage<any>('agent') || {};
  const [data, setData] = useState<Agent | null>(null);

  useEffect(
    () => {
      function handleDataChange(newData: Agent) {
        setData(newData);
      }

      const unsubscribe = id && adminUrl
        ? getDefaultTest2CodeSocket(token).subscribe(
          '/active-scope',
          handleDataChange,
          { agentId: id, buildVersion, type: 'AGENT' },
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
