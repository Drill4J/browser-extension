import createMessageRouter from './message-router';
import setupRuntimeMessageListener from './runtime-message-listener';
import initBackendApi from './backend-api';
import jsCoverageRecorder from './js-coverage-recorder';
import { transformHost } from '../common/util/transform-host';
import * as localStorageUtil from '../common/util/local-storage';
import {
  AdapterInfo,
  AgentAdapter,
  BackendApi,
  BackendCreator,
  ScopeData,
  SessionData,
  SubNotifyFunction,
  TestInfo,
  TestResult,
} from './types';
import { SessionStatus, AgentType, BackendConnectionStatus } from '../common/enums';
import { setupResponseInterceptor } from './response-interceptor';
import { repeatAsync } from '../common/util/repeat-async';
import { setupRequestInterceptor } from './request-interceptor';
import { objectPropsToArray } from '../common/util/object-props-to-array';
import { SessionActionError } from '../common/errors/session-action-error';
import { getHash } from './util';

init();
let backend: any;

async function init() {
  // TODO refactor to store + actions + reducers
  let adapters: Record<string, AgentAdapter> = {};

  // session subscriptions
  const backendConnectionStatusSubs: Record<string, any> = {};
  const backendConnectionStatusSubsCleanup: Record<string, any> = {};
  let backendConnectionStatusData: BackendConnectionStatus = BackendConnectionStatus.UNAVAILABLE;

  // agent subscriptions
  let rawAgentData: Record<string, any> = {};
  let agentsDataById: Record<string, any> = {};
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

  const interceptedDataStore: Record<string, any> = {};
  // const responseInterceptorsCleanup = setupResponseInterceptors(interceptedDataStore);

  // response interceptors
  const responseInterceptor = setupResponseInterceptor();

  // responseInterceptor.add('drill-admin-url', async (backendAddress) => {
  //   await localStorageUtil.save({ backendAddress });
  //   responseInterceptor.remove('drill-admin-url');
  // });

  // eslint-disable-next-line no-param-reassign
  interceptedDataStore.agents = {};
  const agentOrGroupHandler = async (id: string, url: string) => {
    const host = transformHost(url);

    // eslint-disable-next-line no-param-reassign
    interceptedDataStore.agents[id] = host;

    if (agentsDataById[id] && !agentsDataById[id].host) {
      updateAgents(rawAgentData);
    }
  };

  responseInterceptor.add('drill-agent-id', agentOrGroupHandler);
  responseInterceptor.add('drill-group-id', agentOrGroupHandler);

  const requestInterceptorCleanup = setupRequestInterceptor(sessionsData);

  let unsubscribeFromAdmin: any;

  let connectionEstablished = connect(
    (x: any) => {
      // FIXME this is awful
      const prevSubs = backend?.getTest2CodeSubs();
      backend = x;
      if (prevSubs) {
        backend.setTest2CodeSubs(prevSubs);
      }

      backendConnectionStatusData = BackendConnectionStatus.AVAILABLE;
      console.log('Connection established!');

      unsubscribeFromAdmin = backend.subscribeAdmin('/api/agents/build', updateAgents);

      notifyAllSubs(backendConnectionStatusSubs, backendConnectionStatusData);
    },
    (reconnectPromise: any) => {
      backendConnectionStatusData = BackendConnectionStatus.RECONNECTING;
      unsubscribeFromAdmin();
      notifyAllSubs(backendConnectionStatusSubs, backendConnectionStatusData);
      connectionEstablished = reconnectPromise;
    },
  );

  async function updateAgents(data: any) {
    // TODO refactor to store + actions + reducers
    rawAgentData = data;
    const agentAdapters = await agentAdaptersReducer(data, interceptedDataStore?.agents);
    const sgAdapters = await sgAdaptersReducer(data, interceptedDataStore?.agents);

    const newInfo = [...agentAdapters, ...sgAdapters];

    agentsData = newInfo.reduce((a, z) => ({ ...a, [z.host]: z }), {});
    agentsDataById = newInfo.reduce((a, z) => ({ ...a, [z.id]: z }), {});

    adapters = createAdaptersFromInfo(newInfo, backend);

    Object.keys(agentsData).forEach((host) => {
      if (agentSubs[host] && Object.keys(agentSubs[host]).length > 0) {
        notifySubscribers(agentSubs[host], agentsData[host]);
      }
    });
  }

  const runtimeConnectHandler = (port: chrome.runtime.Port) => {
    const portId = port.name || port.sender?.tab?.id;
    console.log('connection on port', portId);

    if (!portId) throw new Error(`Can't assign port id for ${port}`);
    const senderHost = transformHost(port.sender?.url);
    const portMessageHandler = (message: any) => {
      const { type, resource, options } = message;
      const host = transformHost(options) || senderHost;
      console.log(portId, type, host, JSON.stringify(message));

      if (type === 'SUBSCRIBE') {
        if (resource === 'backend-connection-status') {
          if (!backendConnectionStatusSubs[host]) {
            backendConnectionStatusSubs[host] = {};
          }
          backendConnectionStatusSubs[host][portId] = createPortUpdater(port, 'backend-connection-status');
          backendConnectionStatusSubs[host][portId](backendConnectionStatusData);
          backendConnectionStatusSubsCleanup[portId] = () => delete backendConnectionStatusSubs[host][portId];
        }

        if (resource === 'agent') {
          if (!agentSubs[host]) {
            agentSubs[host] = {};
          }
          agentSubs[host][portId] = createPortUpdater(port, 'agent');
          agentSubs[host][portId](agentsData[host]);
          agentSubsCleanup[portId] = () => delete agentSubs[host][portId];
        }

        if (resource === 'session') {
          if (!sessionSubs[host]) {
            sessionSubs[host] = {};
          }
          sessionSubs[host][portId] = createPortUpdater(port, 'session');
          sessionSubs[host][portId](sessionsData[host]);
          sessionSubsCleanup[portId] = () => delete sessionSubs[host][portId];
        }

        if (resource === 'scope') {
          if (!scopeSubs[host]) {
            scopeSubs[host] = {};
          }
          scopeSubs[host][portId] = createPortUpdater(port, 'scope');
          scopeSubs[host][portId](scopesData[host]);

          const agentInfo = agentsData[host];
          const unsubscribe = backend.subscribeTest2Code('/active-scope', scopeSubs[host][portId], agentInfo.id, agentInfo.buildVersion);

          scopeSubsCleanup[portId] = () => {
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
        if (resource === 'backend-connection-status') {
          backendConnectionStatusSubsCleanup[portId]();
        }
      }
    };

    port.onDisconnect.addListener(() => {
      console.log('port.onDisconnect', 'portId', portId);

      if (port.onMessage.hasListener(portMessageHandler)) {
        port.onMessage.removeListener(portMessageHandler);
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

      if (backendConnectionStatusSubsCleanup[portId]) {
        backendConnectionStatusSubsCleanup[portId]();
      }
    });

    port.onMessage.addListener(portMessageHandler);
  };
  chrome.runtime.onConnect.addListener(runtimeConnectHandler);

  const router = createMessageRouter();

  router.add('START_TEST', async (sender: chrome.runtime.MessageSender, { testName, isRealtime }) => {
    const host = transformHost(sender.url);
    const adapter = adapters[host];
    if (!adapter) throw new Error('Backend connection unavailable');
    const sessionId = await adapter.startSession(isRealtime, sender);
    sessionsData[host] = {
      testId: getHash(testName),
      testName,
      sessionId,
      start: Date.now(),
      status: SessionStatus.ACTIVE,
    };
    notifySubscribers(sessionSubs[host], sessionsData[host]);
  });

  router.add('STOP_TEST', async (sender: chrome.runtime.MessageSender, { status }) => {
    const host = transformHost(sender.url);
    const adapter = adapters[host];
    if (!adapter) throw new Error('Backend connection unavailable');
    // TODO !sessionsData[host] check?
    try {
      // FIXME sessionsData[host] juggling
      // adding "end" to sessionData might seem unnecessary
      // but will come in handy later, for re-submitting test result implementation
      sessionsData[host] = {
        ...sessionsData[host],
        end: Date.now(),
      };

      const testInfo: TestInfo = {
        id: sessionsData[host].testId,
        startedAt: sessionsData[host].start,
        finishedAt: Number(sessionsData[host].end),
        result: status.toUpperCase() as TestResult,
        details: {
          testName: sessionsData[host].testName,
        },
      };

      await adapter.addTests(sessionsData[host].sessionId, [testInfo]);
      await adapter.stopSession(sessionsData[host].sessionId, sessionsData[host].testName, sender);
      sessionsData[host] = {
        ...sessionsData[host],
        status: SessionStatus.STOPPED,
      };
    } catch (e) {
      // TODO conditional throwing/not-throwing is kinda unintuitive
      if (e instanceof SessionActionError) {
        sessionsData[host] = {
          ...sessionsData[host],
          status: SessionStatus.ERROR,
          end: Date.now(),
          error: e,
          errorType: 'finish',
        };
      } else {
        throw e;
      }
    }

    notifySubscribers(sessionSubs[host], sessionsData[host]);
  });

  router.add('CANCEL_TEST', async (sender: chrome.runtime.MessageSender) => {
    const host = transformHost(sender.url);
    const adapter = adapters[host];
    if (!adapter) throw new Error('Backend connection unavailable');
    // TODO !sessionsData[host] check?
    try {
      await adapter.cancelSession(sessionsData[host].sessionId, sender);
      sessionsData[host] = {
        ...sessionsData[host],
        status: SessionStatus.CANCELED,
        end: Date.now(),
      };
    } catch (e) {
      // TODO conditional throwing/not-throwing is kinda unintuitive
      if (e instanceof SessionActionError) {
        sessionsData[host] = {
          ...sessionsData[host],
          status: SessionStatus.ERROR,
          end: Date.now(),
          error: e,
          errorType: 'abort',
        };
      } else {
        throw e;
      }
    }
    notifySubscribers(sessionSubs[host], sessionsData[host]);
  });

  router.add('CLEANUP_TEST_SESSION', async (sender: chrome.runtime.MessageSender) => {
    const host = transformHost(sender.url);
    delete sessionsData[host];
    notifySubscribers(sessionSubs[host], sessionsData[host]); // FIXME
  });

  router.add('REACTIVATE_TEST_SESSION', async (sender: chrome.runtime.MessageSender) => {
    const host = transformHost(sender.url);

    sessionsData[host] = {
      ...sessionsData[host],
      status: SessionStatus.ACTIVE,
      end: undefined,
      error: undefined,
    };

    notifySubscribers(sessionSubs[host], sessionsData[host]);
  });

  // FIXME rename that to getIsHostAssociatedWithAgent
  router.add('GET_HOST_INFO', async (sender: chrome.runtime.MessageSender) => {
    const hostConfig = agentsData[transformHost(sender.url)];
    if (!hostConfig) return false;
    return hostConfig;
  });

  router.init(setupRuntimeMessageListener);
}

async function connect(connectCb: any, disconnectCb: any) {
  // TODO add timeout and a way to restart
  const repeatUntilConnect = () =>
    repeatAsync(async () => {
      const connection = await connectToBackend(() => {
        const reconnectPromise = repeatUntilConnect();
        disconnectCb(reconnectPromise);
      });
      connectCb(connection);
      return connection;
    }, true);
  return repeatUntilConnect();
}

async function connectToBackend(disconnectCb: any): Promise<BackendCreator | null> {
  const storage = await localStorageUtil.get('backendAddress');
  const backendAddress = storage?.backendAddress;
  if (!backendAddress) throw new Error('Backend address is not set');

  console.log('received backendAddress', backendAddress);

  return initBackendApi(
    backendAddress,
    (error: any) => {
      disconnectCb(error);
    },
    () => {
      console.log('admin complete');
    },
  );
}

function notifyAllSubs(subsPerHost: Record<string, Record<string, SubNotifyFunction>>, data: BackendConnectionStatus) {
  objectPropsToArray(subsPerHost).forEach((x) => notifySubscribers(x, data));
}

async function agentAdaptersReducer(list: any, agentsHosts: Record<string, string>): Promise<AdapterInfo[]> {
  return list
    .filter((x: any) => !x.groupId) // pick single agents
    .map((x: any) => ({
      adapterType: 'agents',
      id: x.agentId,
      // TODO if host changes on-the-fly (e.g. when popup opened in separate window) it will
      // - get BUSY status
      // - receive no further updates (because host has changed)
      // the same applies for service groups
      // It's not that big of an issue (as-is) but is worth to keep in mind
      host: transformHost(x.build?.systemSettings?.targetHost) || (agentsHosts && agentsHosts[x.agentId]),
      status: x.build?.buildStatus || x.agentStatus,
      buildVersion: x.build?.buildVersion,
      mustRecordJsCoverage: x.agentType.toLowerCase() === AgentType.JAVA_SCRIPT,
    }));
}

async function sgAdaptersReducer(list: any, agentsHosts: Record<string, string>): Promise<AdapterInfo[]> {
  const sgAgents = list.filter((x: any) => x.groupId);
  const groupsKeyValue = sgAgents.reduce((a: any, x: any) => {
    if (!a[x.groupId]) {
      // eslint-disable-next-line no-param-reassign
      a[x.groupId] = {
        adapterType: 'groups',
        id: x.groupId,
        host: transformHost(x.build?.systemSettings?.targetHost) || (agentsHosts && agentsHosts[x.groupId]),
        // TODO think what to do with the SG status
        status: x.build?.buildStatus || x.agentStatus,
        buildVersion: x.build?.buildVersion,
        mustRecordJsCoverage: false,
      };
    }

    if (x.agentType.toLowerCase() === AgentType.JAVA_SCRIPT && x.agentStatus === 'REGISTERED') {
      // eslint-disable-next-line no-param-reassign
      a[x.groupId].mustRecordJsCoverage = true;
    }
    if (!a[x.groupId].host) {
      // eslint-disable-next-line no-param-reassign
      a[x.groupId].host = transformHost(x.systemSettings?.targetHost);
    }
    return a;
  }, {});
  return objectPropsToArray(groupsKeyValue);
}

// eslint-disable-next-line no-shadow
function createAdaptersFromInfo(data: AdapterInfo[], backend: BackendCreator) {
  return data.reduce((a, x) => ({ ...a, [x.host]: createAdapter(x, backend) }), {});
}

function notifySubscribers(subscribers: Record<string, SubNotifyFunction>, data: unknown) {
  objectPropsToArray<SubNotifyFunction>(subscribers).forEach((notify) => notify(data));
}

function createPortUpdater(port: chrome.runtime.Port, resource: string): SubNotifyFunction {
  return (data: any) => {
    port.postMessage({ resource, payload: data });
  };
}

// eslint-disable-next-line no-shadow
function createAdapter(adapterInfo: AdapterInfo, backend: BackendCreator): AgentAdapter {
  const test2CodeRoute = `/${adapterInfo.adapterType}/${adapterInfo.id}/plugins/test2code/dispatch-action`;

  const backendApi: BackendApi = backend.getMethods(test2CodeRoute);

  if (!adapterInfo.mustRecordJsCoverage) {
    return {
      startSession: async (isRealtime) => {
        const sessionId = await backendApi.startSession(isRealtime);
        return sessionId;
      },
      addTests: async (sessionId, tests) => {
        await backendApi.addTests(sessionId, tests);
      },
      stopSession: async (sessionId: string) => {
        await backendApi.stopSession(sessionId);
      },
      cancelSession: async (sessionId: string) => {
        await backendApi.cancelSession(sessionId);
      },
    };
  }
  return {
    startSession: async (isRealtime, sender) => {
      if (!sender) throw new Error('START_TEST_NO_SENDER');
      await jsCoverageRecorder.start(sender);
      const sessionId = await backendApi.startSession(isRealtime);
      return sessionId;
    },
    addTests: async (sessionId, tests) => {
      await backendApi.addTests(sessionId, tests);
    },
    stopSession: async (sessionId, testName, sender) => {
      if (!sender) throw new Error('STOP_TEST_NO_SENDER');
      // TODO current approach works only for a single tab
      // to enable coverage collection from tabs opened during test, we need to attach & start recording on-the-go
      // hook into https://developer.chrome.com/docs/extensions/reference/webNavigation/#event-order
      const data = await jsCoverageRecorder.stop(sender);
      await backendApi.addSessionData(sessionId, { ...data, testId: getHash(testName) });
      await backendApi.stopSession(sessionId);
    },
    cancelSession: async (sessionId, sender) => {
      if (!sender) throw new Error('CANCEL_TEST_NO_SENDER');
      // TODO that could mask other errors
      // quick hack to handle situations when debugger was already disconnected
      try {
        await jsCoverageRecorder.cancel(sender);
      } catch (e) {
        console.log('WARNING', 'failed to disconnect debugger:', e);
      }
      await backendApi.cancelSession(sessionId);
    },
  };
}
