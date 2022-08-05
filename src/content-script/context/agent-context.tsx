/* eslint-disable indent */
import * as React from 'react';
import { useAgentOnHost } from '../../hooks/use-agent-on-host';

export const AgentContext = React.createContext<any>(null);

export const withAgentContext = (WrappedComponent: any) => (props: any) => {
  const { host, ...otherProps } = props;
  const { data: agent } = useAgentOnHost(host);
  return (
    <AgentContext.Provider value={agent}>
      <WrappedComponent {...props} />
    </AgentContext.Provider>
  );
};
