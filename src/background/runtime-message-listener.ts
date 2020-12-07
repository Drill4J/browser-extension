export default function setupRuntimeMessageListener(handler: MessageReceiver) {
  chrome.runtime.onMessage.addListener((message, sender, callback) => {
    (async () => {
      try {
        console.log('chrome.runtime.onMessage', sender, message);
        const data = await handler(sender, message);
        callback(data);
      } catch (e) {
        callback({ error: `Background script error: ${e.message}` });
      }
    })();
    return true;
  });
}
