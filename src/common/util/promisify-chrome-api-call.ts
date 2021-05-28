export function promisifyChromeApiCall<T>(
  apiFunction: (callback: (result?: T) => void) => void,
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    apiFunction((result?: T) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
