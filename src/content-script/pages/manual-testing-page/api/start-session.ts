import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';
import * as backgroundInterop from '../../../../common/background-interop';
import { DomainConfig } from '../../../../types/domain-config';

export async function startSession(activeTab: string, testName: string, config: DomainConfig) {
  const { drillAgentId, drillAgentType = 'Java' } = config;
  const { domains } = await browser.storage.local.get('domains') || {};

  if (drillAgentType === 'JS') {
    // see an updated example method bellow
    await backgroundInterop.sendMessage({ type: 'START_TEST' });
    // or even "better" with
    await backgroundInterop.startTest();
  }

  const { data } = await axios.post(`/agents/${drillAgentId}/plugins/test2code/dispatch-action`, {
    type: 'START',
    payload: { testType: 'MANUAL', testName, isRealtime: true },
  });
  const { data: { payload: { sessionId } } } = data;

  // ? no longer necessary, as background script will handle it in START_TEST handler
  // browser.storage.local.set({
  //   domains: {
  //     ...domains,
  //     [activeTab]: {
  //       ...config, testName, isActive: true, sessionId, timerStart: Date.now(), // TODO let the backend keep track of time
  //     },
  //   },
  // });
}
