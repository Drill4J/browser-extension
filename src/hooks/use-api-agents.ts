import { useEffect, useState } from 'react';
import { getDefaultAdminSocket } from '../common/connection';
import { useAgentConfig } from './use-agent-config';
import { useLocalStorage } from './use-local-storage';

export function useApiAgents() {
  const { drillAdminUrl = '' } = useAgentConfig() || {};
  const { token = '' } = useLocalStorage<any>('token') || {};
  const [agentsConfig, setAgentsConfig] = useState(null);

  useEffect(
    () => {
      function handleDataChange(data: any) {
        setAgentsConfig(data);
      }

      const unsubscribe = drillAdminUrl
        ? getDefaultAdminSocket(token).subscribe(
          '/api/agents',
          handleDataChange,
        )
        : null;

      return () => {
        unsubscribe && unsubscribe();
      };
    },
    [drillAdminUrl, token],
  );

  return agentsConfig;
}
