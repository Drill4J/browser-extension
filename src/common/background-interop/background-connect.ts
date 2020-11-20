import { SubNotifyFunction } from '../../background';

// export function connect(caller: string) {
export function connect() {
  const port = chrome.runtime.connect();
  const subs: Record<string, SubNotifyFunction[]> = {};

  port.onMessage.addListener((message) => {
    const handlers = subs[message.resource];
    if (!Array.isArray(handlers) || handlers.length === 0) {
      console.log('No handler for resource', message.resource);
      return;
    }
    console.log('PORT RECEIVED MESSAGE', message, 'NOTIFY SUBS', handlers);
    handlers.forEach(handler => handler(message.payload));
  });

  return {
    subscribe: (resource: string, handler: (...params: any) => any, options?: any) => {
      console.log('BG CONNECT SUBSCRIBE', resource, handler, options);
      if (!Array.isArray(subs[resource])) {
        subs[resource] = [];
      }
      const isSubscriptionAlreadyExists = subs[resource].length > 0;
      subs[resource].push(handler);

      if (!isSubscriptionAlreadyExists) {
        port.postMessage({ type: 'SUBSCRIBE', resource, options });
      }

      const unsubscribe = () => {
        console.log('BG CONNECT UNSUB', resource, options);

        const index = subs[resource].findIndex(x => x === handler);
        subs[resource].splice(index, 1); // TODO Does it look kinda iffy?

        const noMoreSubsLeft = subs[resource].length === 0;
        if (noMoreSubsLeft) {
          port.postMessage({ type: 'UNSUBSCRIBE', resource, options });
        }
      };
      return unsubscribe;
    },
  };
}
