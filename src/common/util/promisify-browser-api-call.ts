import { browser } from 'webextension-polyfill-ts';

// TODO type it!
// type Callback = (...results: unknown[]) => void;
// type ApiFunction<T extends unknown[], U> = (...params: [...T, U]) => void
// function promisifyBrowserApiCall<T extends unknown[]>(apiFunction: ApiFunction<T, Callback>, ...params: unknown[]) {

export function promisifyBrowserApiCall<T>(apiFunction: any, ...params: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    apiFunction(...params, (result: any) => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}
