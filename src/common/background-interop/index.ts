export function sendMessage(message) {
  return new Promise((resolve, reject)=> {
    // reference https://developer.chrome.com/extensions/runtime#method-sendMessage
    chrome.runtime.sendMessage(null, message, {}, (response) => {
      if (response.error) {
        reject(response.error);
      }
      resolve(response);
    });
  });
}

// OR (just to avoid lots of error-prone typing in content scripts)
export async function startTest() {
  return sendMessage({ type: 'START_TEST' });
}
