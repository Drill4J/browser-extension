import type {
  Handler, MessageReceiver, MessageRouter, MessageSource,
} from './types';

export default function createMessageRouter(): MessageRouter {
  const routes: Record<string, Handler> = {};

  const messageReceiver: MessageReceiver = async (sender, message) => {
    const { type, payload } = message;
    const handler = routes[type];
    if (!handler) {
      throw new Error(`No handler for message ${type}`);
    }
    return handler(sender, payload);
  };

  let initiated = false;

  return {
    add(route, handler) {
      if (initiated) {
        throw new Error('Do not add message handlers after init()');
      }
      routes[route] = handler;
    },
    init(source: MessageSource) {
      initiated = true;
      source(messageReceiver);
    },
  };
}
