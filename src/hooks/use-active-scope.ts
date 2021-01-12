import * as backgroundInterop from '../common/background-interop';
import { useSubscription, useSubscriptionWithAsyncOptions } from './util/use-subscription';

export function useActiveScope() { // TODO type it!
  return useSubscriptionWithAsyncOptions(backgroundInterop.subscribeToActiveScope);
}
