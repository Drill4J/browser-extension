import devToolsApi from './dev-tools-api';

export default {
  start,
  stop,
  cancel,
};

const scriptSources: any = {};

async function start(sender: chrome.runtime.MessageSender) {
  const target = {
    tabId: sender?.tab?.id,
  };

  try {
    await devToolsApi.attach(target);
  } catch (e) {
    console.log('Failed to attach', target, e);
    throw new Error(`Failed to attach a debugger. Tab url: ${sender?.tab?.url} id: ${sender?.tab?.id}`);
  }

  await devToolsApi.sendCommand(target, 'Profiler.enable', {});
  await devToolsApi.sendCommand(target, 'Profiler.startPreciseCoverage', {
    callCount: false,
    detailed: true,
  });

  // FIXME tabId undefined checks
  scriptSources[sender?.tab?.id as any] = {
    hashToUrl: {},
    urlToHash: {},
  };

  chrome.debugger.onEvent.addListener(scriptParsedHandler(sender));

  await devToolsApi.sendCommand(target, 'Debugger.enable', {});
  await devToolsApi.sendCommand(target, 'Debugger.setSkipAllPauses', { skip: true });
}

async function cancel(sender: chrome.runtime.MessageSender) {
  const target = {
    tabId: sender?.tab?.id,
  };
  chrome.debugger.onEvent.removeListener(scriptParsedHandler(sender));
  await devToolsApi.sendCommand(target, 'Profiler.stopPreciseCoverage', {});
  await devToolsApi.sendCommand(target, 'Profiler.disable', {});
  await devToolsApi.sendCommand(target, 'Debugger.disable', {});
  await devToolsApi.detach(target);
  delete scriptSources[sender?.tab?.id as any];
}

async function stop(sender: chrome.runtime.MessageSender) {
  const target = {
    tabId: sender?.tab?.id,
  };
  chrome.debugger.onEvent.removeListener(scriptParsedHandler(sender));
  const data: any = await devToolsApi.sendCommand(target, 'Profiler.takePreciseCoverage', {});
  await devToolsApi.sendCommand(target, 'Profiler.stopPreciseCoverage', {});
  await devToolsApi.sendCommand(target, 'Profiler.disable', {});
  await devToolsApi.sendCommand(target, 'Debugger.disable', {});
  await devToolsApi.detach(target);

  // FIXME see FIXME #1, also scriptsources probably won't change every test. Or will they? (e.g. bundle splitting, modular design etc)
  const sources = scriptSources[sender?.tab?.id as any];
  delete scriptSources[sender?.tab?.id as any];
  return { coverage: data.result, scriptSources: sources };
}

function scriptParsedHandler(sender: chrome.runtime.MessageSender) {
  return (source: chrome.debugger.Debuggee, method: string, params: unknown) => {
    if (method !== 'Debugger.scriptParsed') {
      return;
    }

    const { url, hash } = params as { url: string; scriptId: string; hash: string };

    if (!url || url.includes('chrome-extension:') || url.includes('google-analytics.com') || url.includes('node_modules')) {
      return;
    }

    // TODO check source hashes against expected hashes (obtained by js-parser)
    //      what about filenames?

    // FIXME #1 either clear scriptSources on start/stop or store those by sender?.tab?.id / host
    scriptSources[sender?.tab?.id as any].hashToUrl[hash] = url;
    scriptSources[sender?.tab?.id as any].urlToHash[url] = hash;
  };
}
