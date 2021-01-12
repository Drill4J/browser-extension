import { browser } from 'webextension-polyfill-ts';
import { DomainConfig } from '../../../../types/domain-config';

export async function startSession(activeTab: string, testName: string, config: DomainConfig) {
  const data = await browser.runtime.sendMessage({ type: 'START_TEST', payload: testName });
  console.log('START_TEST res', data);
}
