import { AdapterInfo } from 'background/types';
import chromeApi from '../common/chrome-api';

import * as backgroundInterop from '../common/background-interop';
import { useSubscriptionWithAsyncOptions } from './util/use-subscription';

async function getOptions() {
  const targetHost = await getActiveTabUrl();
  return targetHost;
}

async function getActiveTabUrl() {
  const activeTab = await chromeApi.getActiveTab();
  return activeTab?.url;
}

export function useAgentOnActiveTab() {
  return useSubscriptionWithAsyncOptions<AdapterInfo>(backgroundInterop.subscribeToAgent, getOptions);
}
