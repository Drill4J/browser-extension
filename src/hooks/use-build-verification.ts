import * as React from 'react';
import * as backgroundInterop from '../common/background-interop';
import { useSubscriptionWithAsyncOptions } from './util/use-subscription';

export function useBuildVerification() {
  React.useEffect(() => {
    backgroundInterop.verifyBuild();
  }, []);
  return useSubscriptionWithAsyncOptions(backgroundInterop.subscribeToBuildVerification);
}
