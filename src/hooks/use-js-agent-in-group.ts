import { useEffect, useState } from 'react';
import { Agent } from 'types/agent';
import { useApiAgents } from './use-api-agents';

export function useJsAgentInGroup() {
  const apiAgents = useApiAgents();
  const [jsAgentIsPresent, setState] = useState<Agent | null>(null);

  useEffect(
    () => {
      if (Array.isArray(apiAgents as unknown)) { // TODO use type guard ?
        const index = (apiAgents as unknown as Array<Agent>).findIndex(x => x.agentType.toLowerCase() === 'Node.js'.toLowerCase());
        if (index > -1) {
          setState((apiAgents as unknown as Array<Agent>)[index]);
        }
      }
    },
    [apiAgents],
  );

  return jsAgentIsPresent;
}
