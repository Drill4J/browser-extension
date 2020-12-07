import createMessageRouter from './message-router';
import setupRuntimeMessageListener from './runtime-message-listener';
import initBackendApi from './backend-api';
import jsCoverageRecorder from './js-coverage-recorder';

init();
async function init() {
  const backendAddress = 'http://localhost:8090';
  const backend = await initBackendApi(backendAddress);

  let adapters: Record<string, AgentAdapter> = {};

  // agent subscriptions
  const agentSubs: Record<string, Record<string, SubNotifyFunction>> = {};
  const agentSubsCleanup: Record<string, any> = {};
  let agentsData: Record<string, AdapterInfo> = {};

  // session subscriptions
  const sessionSubs: Record<string, any> = {};
  const sessionSubsCleanup: Record<string, any> = {};
  const sessionsData: Record<string, SessionData> = {};

  // active scope subs
  const scopeSubs: Record<string, any> = {};
  const scopeSubsCleanup: Record<string, any> = {};
  const scopesData: Record<string, ScopeData> = {};

  backend.subscribeAdmin('/api/agents', (data: any) => {
    const newInfo = [
      ...agentAdaptersReducer(data),
      ...sgAdaptersReducer(data),
    ];

    agentsData = newInfo.reduce((a, x) => ({ ...a, [x.host]: x }), {});
    Object.keys(agentsData).forEach((host) => {
      if (agentSubs[host] && Object.keys(agentSubs[host]).length > 0) {
        notifySubscribers(agentSubs[host], agentsData[host]);
      }
    });
    // notifyAgentSubs(agentsData);

    adapters = createAdaptersFromInfo(newInfo, backend);
  });

  chrome.runtime.onConnect.addListener((port) => {
    const portId = port.sender?.tab ? port.sender?.tab.id : port.sender?.id;
    if (!portId) throw new Error(`Can't assign port id for ${port}`);
    const senderHost = transformHost(port.sender?.url);
    const handler = (message: any) => {
      const {
        type, resource, options,
      } = message;
      const host = transformHost(options) || senderHost;
      console.log('MESSAGE from', portId, host, 'with', message);

      if (type === 'SUBSCRIBE') {
        if (resource === 'agent') {
          if (!agentSubs[host]) {
            agentSubs[host] = {};
          }
          if (agentSubs[host][portId]) throw new Error(`Duplicate subscription: resource ${resource}, host ${host}, portId ${portId}`);
          agentSubs[host][portId] = createPortUpdater(port, 'agent');
          agentSubs[host][portId](agentsData[host]);
          agentSubsCleanup[portId] = () => delete agentSubs[host][portId];
        }

        if (resource === 'session') {
          if (!sessionSubs[host]) {
            sessionSubs[host] = {};
          }
          if (sessionSubs[host][portId]) throw new Error(`Duplicate subscription: resource ${resource}, host ${host}, portId ${portId}`);
          sessionSubs[host][portId] = createPortUpdater(port, 'session');
          sessionSubs[host][portId](sessionsData[host]);
          sessionSubsCleanup[portId] = () => delete sessionSubs[host][portId];
        }

        if (resource === 'scope') {
          if (!scopeSubs[host]) {
            scopeSubs[host] = {};
          }
          if (scopeSubs[host][portId]) throw new Error(`Duplicate subscription: resource ${resource}, host ${host}, portId ${portId}`);
          scopeSubs[host][portId] = createPortUpdater(port, 'scope');
          scopeSubs[host][portId](scopesData[host]);

          const agentInfo = agentsData[host];
          const unsubscribe = backend.subscribeTest2Code('/active-scope', scopeSubs[host][portId], agentInfo.id, agentInfo.buildVersion);

          scopeSubsCleanup[portId] = () => {
            console.log('scopeSubsCleanup', portId);
            unsubscribe();
            delete scopeSubs[host][portId];
          };
        }
      }
      if (type === 'UNSUBSCRIBE') {
        if (resource === 'agent') {
          agentSubsCleanup[portId]();
        }
        if (resource === 'session') {
          sessionSubsCleanup[portId]();
        }
        if (resource === 'scope') {
          scopeSubsCleanup[portId]();
        }
      }
    };

    port.onDisconnect.addListener(() => {
      console.log('port.onDisconnect', 'portId', portId);

      if (port.onMessage.hasListener(handler)) {
        port.onMessage.removeListener(handler);
      }

      if (agentSubsCleanup[portId]) {
        agentSubsCleanup[portId]();
      }

      if (sessionSubsCleanup[portId]) {
        sessionSubsCleanup[portId]();
      }

      if (scopeSubsCleanup[portId]) {
        scopeSubsCleanup[portId]();
      }
    });

    port.onMessage.addListener(handler);
  });

  const router = createMessageRouter();

  router.add('START_TEST', async (sender, testName: string) => {
    const host = transformHost(sender.url);
    const adapter = adapters[host];
    const sessionId = await adapter.startTest(testName, sender);
    sessionsData[host] = {
      testName,
      sessionId,
      start: Date.now(),
      status: SessionStatus.ACTIVE,
    };
    notifySubscribers(sessionSubs[host], sessionsData[host]);
  });

  router.add('STOP_TEST', async (sender) => {
    const host = transformHost(sender.url);
    const adapter = adapters[host];
    // TODO !adapter check?
    // TODO !sessionsData[host] check?
    await adapter.stopTest(sessionsData[host].sessionId, sender);

    sessionsData[host] = {
      ...sessionsData[host],
      status: SessionStatus.STOPPED,
      end: Date.now(),
    };
    notifySubscribers(sessionSubs[host], sessionsData[host]);
  });

  router.add('CANCEL_TEST', async (sender) => {
    const host = transformHost(sender.url);
    const adapter = adapters[host];
    // TODO !adapter check?
    // TODO !sessionsData[host] check?
    await adapter.cancelTest(sessionsData[host].sessionId, sender);

    sessionsData[host] = {
      ...sessionsData[host],
      status: SessionStatus.CANCELED,
      end: Date.now(),
    };
    notifySubscribers(sessionSubs[host], sessionsData[host]);
  });

  router.add('CLEANUP_TEST_SESSION', async (sender) => {
    const host = transformHost(sender.url);
    delete sessionsData[host];
    notifySubscribers(sessionSubs[host], sessionsData[host]); // FIXME
  });

  router.add('GET_HOST_INFO', async (sender) => {
    const hostConfig = agentsData[transformHost(sender.url)];
    if (!hostConfig) return false;
    return hostConfig;
  });

  router.init(setupRuntimeMessageListener);
}

function agentAdaptersReducer(agentsList: any): AdapterInfo[] {
  return agentsList
    .filter((x: any) => !x.serviceGroup)
    .map((x: any) => ({
      adapterType: 'agents',
      id: x.id,
      host: transformHost(x.systemSettings?.targetHost),
      status: x.status,
      buildVersion: x.buildVersion,
      mustRecordJsCoverage: x.agentType.toLowerCase() === AGENT_TYPES.JAVA_SCRIPT,
    }));
}

function sgAdaptersReducer(agentsList: any): AdapterInfo[] {
  const sgAdaptersInfoMap: Record<string, AdapterInfo> = agentsList
    .filter((x: any) => x.serviceGroup)
    .reduce((a: any, x: any) => {
      if (!a[x.serviceGroup]) {
        // eslint-disable-next-line no-param-reassign
        a[x.serviceGroup] = {
          adapterType: 'service-groups',
          id: x.serviceGroup,
          host: transformHost(x.systemSettings?.targetHost),
          // TODO think what to do with the SG status
          status: x.status,
          buildVersion: x.buildVersion,
          mustRecordJsCoverage: false,
        };
      }

      if (x.agentType.toLowerCase() === AGENT_TYPES.JAVA_SCRIPT) {
        // eslint-disable-next-line no-param-reassign
        a[x.serviceGroup].mustRecordJsCoverage = true;
      }
      if (!a[x.serviceGroup].host) {
        // eslint-disable-next-line no-param-reassign
        a[x.serviceGroup].host = transformHost(x.systemSettings?.targetHost);
      }
      return a;
    }, {});
  return objectPropsToArray(sgAdaptersInfoMap);
}

function objectPropsToArray<T>(obj: Record<string, T>): T[] {
  const keys = Object.keys(obj);
  return keys.map((x) => obj[x]);
}

function createAdaptersFromInfo(data: AdapterInfo[], backend: BackendCreator) {
  return data.reduce((a, x) => ({ ...a, [x.host]: createAdapter(x, backend) }), {});
}

function notifySubscribers(subscribers: Record<string, SubNotifyFunction>, data: unknown) {
  objectPropsToArray<SubNotifyFunction>(subscribers).forEach(notify => notify(data));
}

function createPortUpdater(port: chrome.runtime.Port, resource: string): SubNotifyFunction {
  return (data: any) => {
    console.log(resource, 'UPDATE', 'with', data);
    port.postMessage({ resource, payload: data });
  };
}

function createAdapter(adapterInfo: AdapterInfo, backend: BackendCreator): AgentAdapter {
  const test2CodeRoute = `/${adapterInfo.adapterType}/${adapterInfo.id}/plugins/test2code/dispatch-action`;

  const backendApi: BackendApi = backend.getMethods(test2CodeRoute);

  if (!adapterInfo.mustRecordJsCoverage) {
    return {
      startTest: async (testName) => {
        const sessionId = await backendApi.startTest(testName);
        return sessionId;
      },
      stopTest: async (sessionId: string) => {
        await backendApi.stopTest(sessionId);
      },
      cancelTest: async (sessionId: string) => {
        await backendApi.cancelTest(sessionId);
      },
    };
  }
  return {
    startTest: async (testName, sender) => {
      if (!sender) throw new Error('START_TEST_NO_SENDER');
      await jsCoverageRecorder.start(sender);
      const sessionId = await backendApi.startTest(testName);
      return sessionId;
    },
    stopTest: async (sessionId, sender) => {
      if (!sender) throw new Error('STOP_TEST_NO_SENDER');
      const data = await jsCoverageRecorder.stop(sender);
      await backendApi.addSessionData(sessionId, data);
      await backendApi.stopTest(sessionId);
    },
    cancelTest: async (sessionId, sender) => {
      if (!sender) throw new Error('CANCEL_TEST_NO_SENDER');
      await jsCoverageRecorder.cancel(sender);
      await backendApi.cancelTest(sessionId);
    },
  };
}

export function transformHost(targetHost: string | undefined) {
  if (!targetHost) return '';
  const url = new URL(targetHost);
  const { protocol, host } = url;
  return `${protocol}//${host}`;
}

const AGENT_TYPES = {
  JAVA: 'java',
  JAVA_SCRIPT: 'node.js',
};

interface AgentAdapter {
  startTest: (testName: string, sender?: chrome.runtime.MessageSender) => Promise<string>;
  stopTest: (sessionId: string, sender?: chrome.runtime.MessageSender) => Promise<void>;
  cancelTest: (sessionId: string, sender?: chrome.runtime.MessageSender) => Promise<void>;
}

export type SessionData = {
  testName: string;
  sessionId: string;
  start: number;
  end?: number;
  status: SessionStatus;
}

export type ScopeData = Record<string, any>; // TODO type it properly!

export enum SessionStatus {
  ACTIVE = 'active',
  STOPPED = 'stopped',
  CANCELED = 'canceled',
}

export type SubNotifyFunction = (data: unknown) => void;
type AdapterType = 'agents' | 'service-groups';

interface AdapterInfo {
  adapterType: AdapterType;
  id: string;
  host: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | '';
  mustRecordJsCoverage: boolean;
  buildVersion?: string;
}

interface BackendApi {
  startTest: (testName: string) => Promise<string>;
  stopTest: (sessionId: string) => Promise<void>;
  cancelTest: (sessionId: string) => Promise<void>;
  addSessionData: (sessionId: string, data: unknown) => Promise<void>;
}

interface BackendCreator {
  getMethods(baseUrl: string): BackendApi;
}
