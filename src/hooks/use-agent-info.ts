import { useState, useEffect } from 'react';

import { getDefaultAdminSocket } from '../common/connection';
import { Agent } from '../types/agent';

export function useAgentInfo(adminUrl?: string, agentId?: string) {
  const [data, setData] = useState<Agent | null>(null);

  useEffect(
    () => {
      function handleDataChange(newData: any) {
        setData(newData);
      }

      const connection =
        agentId && adminUrl
          ? getDefaultAdminSocket(adminUrl).subscribe(`/get-agent/${agentId}`, handleDataChange)
          : null;

      return () => {
        connection && connection.unsubscribe(`/get-agent/${agentId}`);
      };
    },
    [adminUrl, agentId],
  );

  return data;
}
