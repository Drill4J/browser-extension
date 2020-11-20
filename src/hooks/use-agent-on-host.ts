import * as backgroundInterop from '../common/background-interop';
import { useSubscription } from './util/use-subscription';

export function useAgentOnHost(host?: string) {
  return useSubscription(backgroundInterop.subscribeToAgent, host);
}
