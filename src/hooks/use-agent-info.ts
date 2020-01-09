import { useState, useEffect } from 'react';

import { getDefaultAdminSocket } from '../common/connection';
import { Agent } from '../types/agent';

export function useAgentInfo(adminUrl?: string, agentId?: string, token?: string) {
  const [data, setData] = useState<Agent | null>(null);

  useEffect(
    () => {
      function handleDataChange(newData: any) {
        setData(newData);
      }

      const unsubscribe =
        agentId && adminUrl
          ? getDefaultAdminSocket(adminUrl, token).subscribe(
              `/get-agent/${agentId}`,
              handleDataChange,
            )
          : null;

      return () => {
        unsubscribe && unsubscribe();
      };
    },
    [adminUrl, agentId],
  );

  return data;
}
