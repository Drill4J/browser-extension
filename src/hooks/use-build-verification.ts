import * as backgroundInterop from '../common/background-interop';
import { useSubscriptionWithAsyncOptions } from './util/use-subscription';

export function useBuildVerification() {
  return useSubscriptionWithAsyncOptions(backgroundInterop.subscribeToBuildVerification);
}
