import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';
import nanoid from 'nanoid';

import { DomainConfig } from '../../../../types/domain-config';

export async function startSession(activeTab: string, testName: string, config: DomainConfig) {
  const { drillAgentId, drillAgentType = 'Java', drillAdminUrl } = config;
  const { domains } = await browser.storage.local.get('domains') || {};

  if (drillAgentType === 'JS') {
    const connection = axios.create({ baseURL: `http://${drillAdminUrl}` });
    const sessionId = nanoid();

    browser.runtime.sendMessage({ action: 'START_TEST', testName });

    await connection.post(`/agents/${drillAgentId}/plugins/test2code/sessions/${sessionId}`);

    browser.runtime.sendMessage({ action: 'START_TEST' });

    browser.storage.local.set({
      domains: {
        ...domains,
        [activeTab]: {
          ...config, testName, isActive: true, sessionId, timerStart: Date.now(),
        },
      },
    });
  } else {
    const { data } = await axios.post(`/agents/${drillAgentId}/plugins/test2code/dispatch-action`, {
      type: 'START',
      payload: { testType: 'MANUAL', isRealtime: true },
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
}
