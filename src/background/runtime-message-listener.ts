import type { MessageReceiver } from './types';

export default function setupRuntimeMessageListener(handler: MessageReceiver) {
  chrome.runtime.onMessage.addListener((message, sender, callback) => {
    (async () => {
      try {
        const data = await handler(sender, message);
        callback(data);
      } catch (e: any) {
        callback({ error: { message: `Background script error: ${e?.message}`, stack: e?.stack } });
      }
    })();
    return true;
  });
}
