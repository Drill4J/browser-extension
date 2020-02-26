import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

import { AgentConfig } from '../../../../types/agent-config';

export async function startGroupSession(activeTab: string, testName: string, config: AgentConfig) {
  const { drillGroupId } = config;
  const { data: [response] } = await axios.post(`/service-groups/${drillGroupId}/plugins/test2code/dispatch-action`, {
    type: 'START',
    payload: { testType: 'MANUAL' },
  });
  const { data: { payload: { sessionId } } } = response;

  browser.storage.local.set({
    [activeTab]: {
      ...config, testName, isActive: true, sessionId, timerStart: Date.now(),
    },
  });
}
