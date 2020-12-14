import * as backgroundInterop from '../common/background-interop';
import { useSubscription, useSubscriptionWithAsyncOptions } from './util/use-subscription';
import type { SessionData } from '../background/types';
import { SubscriptionState } from './util/types';

export function useSession(subname?: string): SubscriptionState<SessionData> { // TODO type it!
  return useSubscriptionWithAsyncOptions(backgroundInterop.subscribeToSession, subname);
}
