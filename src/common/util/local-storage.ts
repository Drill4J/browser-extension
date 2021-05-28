/* eslint-disable consistent-return */
import { browser } from 'webextension-polyfill-ts';
import { promisifyChromeApiCall } from './promisify-chrome-api-call';

export async function get(keys?: string | string[] | undefined) {
  return browser.storage.local.get(keys);
}

export async function save(data: any) {
  const storage = await browser.storage.local.get();
  await browser.storage.local.set({ ...storage, ...data });
}

type Keys = string | string[] | Record<string, any> | null;

export const getStorage = (keys: Keys) => promisifyChromeApiCall<Record<string, any>>((cb) => chrome.storage.local.get(keys, cb));
export const addToStorage = (items: Record<string, any>) => promisifyChromeApiCall((cb) => chrome.storage.local.set(items, cb));
