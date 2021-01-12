import xxHashJs from 'xxhashjs';
import devToolsApi from './dev-tools-api';

export default {
  start,
  stop,
  cancel,
};

const scriptSources: any = {};

async function reloadTabWithId(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.tabs.reload(tabId, { bypassCache: true }, () => {
      resolve();
    });
  });
}

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

  chrome.debugger.onEvent.addListener(async (source, method, params) => {
    if (method !== 'Debugger.scriptParsed') {
      return;
    }

    const { url, scriptId } = params as { url: string; scriptId: string };

    if (!url || url.startsWith('chrome-extension:') || url.includes('google-analytics.com') || url.includes('node_modules')) {
      return;
    }

    const rawScriptSource: any = await devToolsApi.sendCommand(target, 'Debugger.getScriptSource', { scriptId });
    const hash = getHash(unifyLineEndings(rawScriptSource.scriptSource));
    // TODO check source hashes agains expected build hashes
    //      what about filenames?

    // FIXME tabId undefined checks
    if (!scriptSources[sender?.tab?.id as any]) {
      scriptSources[sender?.tab?.id as any] = {};
    }
    // FIXME #1 either clear scriptSources on start/stop or store those by sender?.tab?.id / host
    scriptSources[sender?.tab?.id as any][hash] = url;
  });

  await devToolsApi.sendCommand(target, 'Debugger.enable', {});
  await devToolsApi.sendCommand(target, 'Debugger.setSkipAllPauses', { skip: true });
}

async function cancel(sender: chrome.runtime.MessageSender) {
  const target = {
    tabId: sender?.tab?.id,
  };
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

function getHash(data: any) {
  const seed = 0xABCD;
  const hashFn = xxHashJs.h32(seed);
  return hashFn.update(data).digest().toString(16);
}

function unifyLineEndings(str: string): string {
  // reference https://www.ecma-international.org/ecma-262/10.0/#sec-line-terminators
  const LF = '\u000A';
  const CRLF = '\u000D\u000A';
  const LS = '\u2028';
  const PS = '\u2029';
  return str.replace(RegExp(`(${CRLF}|${LS}|${PS})`, 'g'), LF);
}
