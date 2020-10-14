import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

import { DomainConfig } from '../../../../types/domain-config';

export async function startSession(activeTab: string, testName: string, config: DomainConfig) {
  const { drillAgentId, drillAgentType = 'Java' } = config;
  const { domains } = await browser.storage.local.get('domains') || {};

  if (drillAgentType === 'JS') {
    browser.runtime.sendMessage({ action: 'START_TEST' });
  }

  const { data } = await axios.post(`/agents/${drillAgentId}/plugins/test2code/dispatch-action`, {
    type: 'START',
    payload: { testType: 'MANUAL', testName, isRealtime: true },
  });
  const { data: { payload: { sessionId } } } = data;

  browser.storage.local.set({
    domains: {
      ...domains,
      [activeTab]: {
        ...config, testName, isActive: true, sessionId, timerStart: Date.now(), // TODO let the backend keep track of time
      },
    },
  });
}
