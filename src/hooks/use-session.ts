import * as backgroundInterop from '../common/background-interop';
import { useSubscription } from './util/use-subscription';
import { SessionData } from '../background/index';

export function useSession(subname?: string): SessionData | null { // TODO type it!
  return useSubscription(backgroundInterop.subscribeToSession, subname);
}
