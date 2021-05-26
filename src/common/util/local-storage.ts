import { browser } from 'webextension-polyfill-ts';

export async function get(keys?: string | string[] | undefined) {
  return browser.storage.local.get(keys);
}

export async function save(data: any) {
  const storage = await browser.storage.local.get();
  await browser.storage.local.set({ ...storage, ...data });
}

// export async function get(keys: string | string[] | Record<string, any> | null, callback: (items: { [key: string]: any }) => void) {
//   return chrome.storage.local.get(keys, callback);
// }

// export async function save(data: any) {
//   const storage = chrome.storage.local.get(null);
//   await chrome.storage.local.set({ ...storage, ...data });
// }
