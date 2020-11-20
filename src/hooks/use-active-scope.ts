import * as backgroundInterop from '../common/background-interop';
import { useSubscription } from './util/use-subscription';

export function useActiveScope(): any { // TODO type it!
  return useSubscription(backgroundInterop.subscribeToActiveScope);
}
