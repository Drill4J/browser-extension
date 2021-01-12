import { browser } from 'webextension-polyfill-ts';

export async function get(keys?: string | string[] | undefined) {
  return browser.storage.local.get(keys);
}

export async function save(data: any) {
  const storage = await browser.storage.local.get();
  console.log('storage', storage, 'new data', data);
  await browser.storage.local.set({ ...storage, ...data });
}
