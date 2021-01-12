import * as backgroundInterop from '../common/background-interop';
import { useSubscription, useSubscriptionWithAsyncOptions } from './util/use-subscription';

export function useAgentOnHost(host?: string) {
  return useSubscriptionWithAsyncOptions(backgroundInterop.subscribeToAgent, host);
}
