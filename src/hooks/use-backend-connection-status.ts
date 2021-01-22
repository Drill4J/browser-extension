import * as backgroundInterop from '../common/background-interop';
import { useSubscriptionWithAsyncOptions } from './util/use-subscription';

export function useBackendConnectionStatus<T>() {
  return useSubscriptionWithAsyncOptions<T>(backgroundInterop.subscribeToBackendConnectionStatus);
}
