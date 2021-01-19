/* eslint-disable indent */
import * as React from 'react';
import { useActiveScope } from '../../hooks/use-active-scope';

export const ActiveScopeContext = React.createContext<any>(null);

export const withActiveScopeContext = (WrappedComponent: any) => (props: any) => {
  const { data } = useActiveScope();
  console.log('withActiveScopeContext', data);
  return (
    <ActiveScopeContext.Provider value={data}>
      <WrappedComponent {...props} />
    </ActiveScopeContext.Provider>
  );
};
