import { BackendConnectionStatus } from '../common/enums';
import * as backgroundInterop from '../common/background-interop';
import { useSubscriptionWithAsyncOptions } from './util/use-subscription';

export function useBackendConnectionStatus() {
  return useSubscriptionWithAsyncOptions<BackendConnectionStatus>(backgroundInterop.subscribeToBackendConnectionStatus);
}
