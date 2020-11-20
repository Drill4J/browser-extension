export default function setupRuntimeMessageListener(handler: MessageReceiver) {
  chrome.runtime.onMessage.addListener((message, sender, callback) => {
    (async () => {
      try {
        console.log('MESSAGE', sender, message);
        const data = await handler(sender, message);
        console.log('MESSAGE RESP', data);
        callback(data);
      } catch (e) {
        callback({ error: `Background script error: ${e.message}` });
      }
    })();
    return true;
  });
}
