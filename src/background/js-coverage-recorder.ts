import devToolsApi from './dev-tools-api';
import { ScriptSources } from './types';

export default {
  start,
  stop,
  cancel,
};

let scriptSources: ScriptSources = {};

async function start(sender: chrome.runtime.MessageSender, sources: ScriptSources) {
  await devToolsApi.sendCommand({ tabId: sender?.tab?.id }, 'Profiler.enable', {});
  await devToolsApi.sendCommand({ tabId: sender?.tab?.id }, 'Profiler.startPreciseCoverage', {
    callCount: false,
    detailed: true,
  });
  scriptSources = sources;
  console.log('>>>', scriptSources);
}

async function cancel(sender: chrome.runtime.MessageSender) {
  const target = {
    tabId: sender?.tab?.id,
  };
  await devToolsApi.sendCommand(target, 'Profiler.stopPreciseCoverage', {});
  await devToolsApi.sendCommand(target, 'Profiler.disable', {});
  await devToolsApi.sendCommand(target, 'Debugger.disable', {});
  await devToolsApi.detach(target);
}

async function stop(sender: chrome.runtime.MessageSender) {
  const target = {
    tabId: sender?.tab?.id,
  };

  const data: any = await devToolsApi.sendCommand(target, 'Profiler.takePreciseCoverage', {});
  await devToolsApi.sendCommand(target, 'Profiler.stopPreciseCoverage', {});
  await devToolsApi.sendCommand(target, 'Profiler.disable', {});
  await devToolsApi.sendCommand(target, 'Debugger.disable', {});
  // await devToolsApi.detach(target);

  // FIXME see FIXME #1, also scriptsources probably won't change every test. Or will they? (e.g. bundle splitting, modular design etc)
  const sources = scriptSources[sender?.tab?.id as any];
  return { coverage: data.result, scriptSources: sources };
}
