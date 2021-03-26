import * as backgroundInterop from '../common/background-interop';
import { useSubscriptionWithAsyncOptions } from './util/use-subscription';

export function useBuildVerification(tab: any) {
  return useSubscriptionWithAsyncOptions(backgroundInterop.subscribeToBuildVerification, tab);
}
