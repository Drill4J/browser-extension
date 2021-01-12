import * as backgroundInterop from '../common/background-interop';
import { useSubscriptionWithAsyncOptions } from './util/use-subscription';

export function useBackendConnectionStatus() {
  return useSubscriptionWithAsyncOptions(backgroundInterop.subscribeToBackendConnectionStatus);
}
