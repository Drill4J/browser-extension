import * as backgroundInterop from '../common/background-interop';
import { useSubscription } from './util/use-subscription';
import type { SessionData } from '../background/types';

export function useSession(subname?: string): SessionData | null { // TODO type it!
  return useSubscription(backgroundInterop.subscribeToSession, subname);
}
