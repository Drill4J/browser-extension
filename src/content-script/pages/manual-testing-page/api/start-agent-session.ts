import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

import { DomainConfig } from '../../../../types/domain-config';

export async function startAgentSession(activeTab: string, testName: string, config: DomainConfig) {
  const { drillAgentId } = config;
  const { domains } = await browser.storage.local.get('domains') || {};
  const { data } = await axios.post(`/agents/${drillAgentId}/plugins/test2code/dispatch-action`, {
    type: 'START',
    payload: { testType: 'MANUAL' },
  });
  const { data: { payload: { sessionId } } } = data;

  browser.storage.local.set({
    domains: {
      ...domains,
      [activeTab]: {
        ...config, testName, isActive: true, sessionId, timerStart: Date.now(),
      },
    },
  });
}
