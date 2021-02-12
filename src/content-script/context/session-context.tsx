/* eslint-disable indent */
import * as React from 'react';
import { useSession } from '../../hooks/use-session';

export const SessionContext = React.createContext<any>(null);

export const withSessionContext = (WrappedComponent: any) => (props: any) => {
  const { data } = useSession();
  console.log('withSessionContext', data);
  return (
    <SessionContext.Provider value={data}>
      <WrappedComponent {...props} />
    </SessionContext.Provider>
  );
};
