import axios from 'axios';
import { Agent } from 'types/agent';
import { browser } from 'webextension-polyfill-ts';

import { DomainConfig } from '../../../../types/domain-config';

export async function startGroupSession(activeTab: string, testName: string, config: DomainConfig, jsAgentInGroup: Agent | null) {
  const { drillGroupId } = config;
  const { domains } = await browser.storage.local.get('domains') || {};
  const { data: [response] } = await axios.post(`/service-groups/${drillGroupId}/plugins/test2code/dispatch-action`, {
    type: 'START',
    payload: { testType: 'MANUAL', testName },
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

  if (jsAgentInGroup) {
    await browser.runtime.sendMessage({ action: 'START_TEST', testName });
  }
}
