import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

import { AgentConfig } from '../../../../types/agent-config';

export async function startAgentSession(activeTab: string, testName: string, config: AgentConfig) {
  const { drillAgentId } = config;
  const { data } = await axios.post(`/agents/${drillAgentId}/plugins/test2code/dispatch-action`, {
    type: 'START',
    payload: { testType: 'MANUAL' },
  });
  const { data: { payload: { sessionId } } } = data;

  browser.storage.local.set({
    [activeTab]: {
      ...config, testName, isActive: true, sessionId, timerStart: Date.now(),
    },
  });
}
