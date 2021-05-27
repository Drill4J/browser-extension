/* eslint-disable consistent-return */
import { browser } from 'webextension-polyfill-ts';

export async function get(keys?: string | string[] | undefined) {
  return browser.storage.local.get(keys);
}

export async function save(data: any) {
  const storage = await browser.storage.local.get();
  await browser.storage.local.set({ ...storage, ...data });
}

type Keys = string | string[] | Record<string, any> | null;

export const getStorage = async (keys: Keys): Promise<Record<string, any>> => new Promise((resolve, reject) => {
  chrome.storage.local.get(keys, (items) => {
    if (chrome.runtime.lastError) {
      return reject(chrome.runtime.lastError);
    }
    resolve(items);
  });
});

export const addToStorage = async (data: Record<string, any>) => {
  const storage = await getStorage(null);
  chrome.storage.local.set({ ...storage, ...data });
};
