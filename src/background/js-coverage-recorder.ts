import devToolsApi from './dev-tools-api';

export default {
  start,
  stop,
  cancel,
};

const tabsScripts: Record<string, unknown[]> = {};

async function start(sender: chrome.runtime.MessageSender) {
  const target: chrome.debugger.Debuggee = {
    tabId: sender?.tab?.id,
  };

  try {
    await devToolsApi.attach(target);
  } catch (e: any) {
    console.log('Failed to attach', target, e);
    throw new Error(
      `Failed to attach a debugger. Try opening another tab. url: ${sender?.tab?.url} id: ${sender?.tab?.id}. Reason: ${e?.message}`,
    );
  }

  // HACK#1 to ensure detailed coverage collection when page reloads
  // see https://jiraeu.epam.com/browse/EPMDJ-10335
  // and https://bugs.chromium.org/p/chromium/issues/detail?id=1311673
  await devToolsApi.sendCommand(target, 'Network.enable', {});
  await devToolsApi.sendCommand(target, 'Network.setCacheDisabled', { cacheDisabled: true });

  await devToolsApi.sendCommand(target, 'Profiler.enable', {});
  await devToolsApi.sendCommand(target, 'Profiler.startPreciseCoverage', {
    callCount: false,
    detailed: true,
  });

  // FIXME tabId undefined checks
  tabsScripts[sender?.tab?.id as any] = [];

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
  delete tabsScripts[sender?.tab?.id as any];
}

async function stop(sender: chrome.runtime.MessageSender) {
  const target = {
    tabId: sender?.tab?.id,
  };
  chrome.debugger.onEvent.removeListener(scriptParsedHandler(sender));
  const coverage = await devToolsApi.sendCommand(target, 'Profiler.takePreciseCoverage', {});
  await devToolsApi.sendCommand(target, 'Profiler.stopPreciseCoverage', {});
  await devToolsApi.sendCommand(target, 'Profiler.disable', {});
  await devToolsApi.sendCommand(target, 'Debugger.disable', {});

  // HACK#1 (ctrl+f to find description above)
  await devToolsApi.sendCommand(target, 'Network.setCacheDisabled', { cacheDisabled: false });
  await devToolsApi.sendCommand(target, 'Network.disable', {});

  await devToolsApi.detach(target);

  // FIXME see FIXME #1, also scripts probably won't change every test. Or will they? (e.g. bundle splitting, modular design etc)
  const scripts = tabsScripts[sender?.tab?.id as any];
  delete tabsScripts[sender?.tab?.id as any];
  return { coverage: JSON.stringify(coverage), scripts: JSON.stringify(scripts) };
}

// TODO test if sender.tabId is ever undefined
// TODO test if (source.tabId != sender.tabId) is ever possible? Perhaps for <iframe>s or content scripts?
// TODO check source hashes against expected hashes (obtained by js-parser) / check filenames as well?
function scriptParsedHandler(sender: chrome.runtime.MessageSender) {
  return (source: chrome.debugger.Debuggee, method: string, params: any) => {
    if (method !== 'Debugger.scriptParsed') return;
    if (!params?.url || isIgnoredUrl(params.url)) return;
    tabsScripts[sender?.tab?.id as any].push(params);
  };
}

function isIgnoredUrl(testUrl: string) {
  const ignoredUrlChunks = ['chrome-extension:', 'google-analytics.com', 'node_modules']; // TODO allow to configure via settings?
  return ignoredUrlChunks.some((ignoredUrl) => testUrl.includes(ignoredUrl));
}
