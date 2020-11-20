import { useState, useEffect } from 'react';

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

export function useSubscriptionWithAsyncOptions<T>(subscribe: (...params: any[]) => () => void, getOptions: () => Promise<any>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);

  useEffect(() => {
    let isCleanupCalled = false;
    let unsubscribe: () => any;

    const cleanup = () => {
      isCleanupCalled = true;
      unsubscribe && unsubscribe();
    };

    (async () => {
      try {
        const options = await getOptions();
        if (isCleanupCalled) return;
        unsubscribe = subscribe((newData: T) => {
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
