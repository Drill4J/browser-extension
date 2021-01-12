import { useState, useEffect } from 'react';
import type { SubscriptionState } from './types';

export function useSubscription<T>(subscribe: (...params: any[]) => () => void, options?: any) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe((newData: T) => {
      console.log('useSubscription handler', 'options', options, 'newData', newData);
      setData(newData);
    }, options);
    return unsubscribe;
  }, [subscribe, options]);

  return data;
}

type asyncOp = () => Promise<any>;
type syncOp = () => any;
const noop = () => {};
export function useSubscriptionWithAsyncOptions<T>(
  subscribe: (...params: any[]) => Promise<() => void>, getOptions: asyncOp | syncOp | unknown = noop,
): SubscriptionState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);

  useEffect(() => {
    let isCleanupCalled = false;
    let unsubscribe: () => any;

    const cleanup = () => {
      console.log('ASYNC SUB CLEANUP', getOptions);
      isCleanupCalled = true;
      unsubscribe && unsubscribe();
    };

    (async () => {
      try {
        const options = typeof getOptions === 'function' ? await (getOptions() as Promise<any>) : getOptions;
        if (isCleanupCalled) return;
        console.log('ASYNC SUB CALL', getOptions);
        unsubscribe = await subscribe((newData: T) => {
          console.log('ASYNC SUB UPDATE', getOptions);
          setData(newData);
          setIsLoading(false);
        }, options);
      } catch (e) {
        setIsLoading(false);
        // TODO think of a way to distinguish unexpected errors from server errors / intentionally thrown errors
        setIsError(`Subscription failed with error: ${e.message}`);
      }
    })();

    return cleanup;
  }, [subscribe, getOptions]);

  return { data, isLoading, isError };
}
