import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

import { DomainConfig } from '../../../../types/domain-config';

export async function startGroupSession(activeTab: string, testName: string, config: DomainConfig) {
  const { drillGroupId } = config;
  const { domains } = await browser.storage.local.get('domains') || {};
  const { data: [response] } = await axios.post(`/service-groups/${drillGroupId}/plugins/test2code/dispatch-action`, {
    type: 'START',
    payload: { testType: 'MANUAL' },
  });
  const { data: { payload: { sessionId } } } = response;

  browser.storage.local.set({
    domains: {
      ...domains,
      [activeTab]: {
        ...config, testName, isActive: true, sessionId, timerStart: Date.now(),
      },
    },
  });
}
