import createMessageRouter from './message-router';
import setupRuntimeMessageListener from './runtime-message-listener';
import initBackendApi from './backend-api';
import jsCoverageRecorder from './js-coverage-recorder';
import { transformHost } from '../common/util/transform-host';
import * as localStorageUtil from '../common/util/local-storage';
import type {
  AdapterInfo,
  AgentAdapter,
  BackendApi,
  BackendCreator,
  ScopeData,
  SessionData,
  SubNotifyFunction,
} from './types';
import { SessionStatus, AgentType, BackendConnectionStatus } from '../common/enums';
import { setupResponseInterceptor } from './response-interceptor';
import { repeatAsync } from '../common/util/repeat-async';
import { setupRequestInterceptor } from './request-interceptor';
import { objectPropsToArray } from '../common/util/object-props-to-array';
import { SessionActionError } from '../common/errors/session-action-error';

init();
async function init() {
  const iterceptedDataStore: Record<string, any> = {};
  const responseInterceptorsCleanup = setupResponseInterceptors(iterceptedDataStore);

  let backend: any;
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

      unsubscribeFromAdmin = backend.subscribeAdmin('/api/agents', (data: any) => {
        const newInfo = [
          ...agentAdaptersReducer(data, iterceptedDataStore?.agents),
          ...sgAdaptersReducer(data, iterceptedDataStore?.agents),
        ];
        agentsData = newInfo.reduce((a, z) => ({ ...a, [z.host]: z }), {});
        Object.keys(agentsData).forEach((host) => {
          if (agentSubs[host] && Object.keys(agentSubs[host]).length > 0) {
            notifySubscribers(agentSubs[host], agentsData[host]);
          }
        });
        adapters = createAdaptersFromInfo(newInfo, backend);
      });

      notifyAllSubs(backendConnectionStatusSubs, backendConnectionStatusData);
    },
    (reconnectPromise: any) => {
      backendConnectionStatusData = BackendConnectionStatus.RECONNECTING;
      unsubscribeFromAdmin();
      notifyAllSubs(backendConnectionStatusSubs, backendConnectionStatusData);
      connectionEstablished = reconnectPromise;
    },
  );

  let adapters: Record<string, AgentAdapter> = {};

  // session subscriptions
  const backendConnectionStatusSubs: Record<string, any> = {};
  const backendConnectionStatusSubsCleanup: Record<string, any> = {};
  let backendConnectionStatusData: BackendConnectionStatus = BackendConnectionStatus.UNAVAILABLE;

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

  const runtimeConnectHandler = (port: chrome.runtime.Port) => {
    const portId = port.sender?.tab ? port.sender?.tab.id : port.sender?.id;
    if (!portId) throw new Error(`Can't assign port id for ${port}`);
    const senderHost = transformHost(port.sender?.url);
    const portMessageHandler = (message: any) => {
      const {
        type, resource, options,
      } = message;
      const host = transformHost(options) || senderHost;
      console.log('MESSAGE from', portId, host, 'with', message);

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

  const requestInterceptorCleanup = setupRequestInterceptor(sessionsData);

  const router = createMessageRouter();

  router.add('START_TEST', async (sender: chrome.runtime.MessageSender, testName: string) => {
    const host = transformHost(sender.url);
    const adapter = adapters[host];
    if (!adapter) throw new Error('Backend connection unavailable');
    const sessionId = await adapter.startTest(testName, sender);
    sessionsData[host] = {
      testName,
      sessionId,
      start: Date.now(),
      status: SessionStatus.ACTIVE,
    };
    notifySubscribers(sessionSubs[host], sessionsData[host]);
  });

  router.add('STOP_TEST', async (sender: chrome.runtime.MessageSender) => {
    const host = transformHost(sender.url);
    const adapter = adapters[host];
    if (!adapter) throw new Error('Backend connection unavailable');
    // TODO !sessionsData[host] check?
    try {
      await adapter.stopTest(sessionsData[host].sessionId, sender);
      sessionsData[host] = {
        ...sessionsData[host],
        status: SessionStatus.STOPPED,
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
      await adapter.cancelTest(sessionsData[host].sessionId, sender);
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
  const repeatUntilConnect = () => repeatAsync(async () => {
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

  const backend = await initBackendApi(
    backendAddress,
    (error: any) => {
      disconnectCb(error);
    },
    () => {
      console.log('admin complete');
    },
  );
  return backend;
}

function notifyAllSubs(subsPerHost: Record<string, Record<string, SubNotifyFunction>>, data: BackendConnectionStatus) {
  objectPropsToArray(subsPerHost).forEach(x => notifySubscribers(x, data));
}

function setupResponseInterceptors(interceptedDataStore: Record<string, any>) {
  // response interceptors
  const responseInterceptor = setupResponseInterceptor();

  responseInterceptor.add('drill-admin-url', async (backendAddress) => {
    await localStorageUtil.save({ backendAddress });
    responseInterceptor.remove('drill-admin-url');
  });

  // eslint-disable-next-line no-param-reassign
  interceptedDataStore.agents = {};
  const agentOrGroupHandler = async (id: string, host: string) => {
    // eslint-disable-next-line no-param-reassign
    interceptedDataStore.agents[id] = host;
  };

  responseInterceptor.add('drill-agent-id', agentOrGroupHandler);
  responseInterceptor.add('drill-group-id', agentOrGroupHandler);

  return () => responseInterceptor.cleanup();
}

function agentAdaptersReducer(agentsList: any, agentsHosts: Record<string, string>): AdapterInfo[] {
  return agentsList
    .filter((x: any) => !x.serviceGroup)
    .map((x: any) => ({
      adapterType: 'agents',
      id: x.id,
      host: transformHost(x.systemSettings?.targetHost) || (agentsHosts && agentsHosts[x.id]),
      status: x.status,
      buildVersion: x.buildVersion,
      mustRecordJsCoverage: x.agentType.toLowerCase() === AgentType.JAVA_SCRIPT,
    }));
}

function sgAdaptersReducer(agentsList: any, agentsHosts: Record<string, string>): AdapterInfo[] {
  const sgAdaptersInfoMap: Record<string, AdapterInfo> = agentsList
    .filter((x: any) => x.serviceGroup)
    .reduce((a: any, x: any) => {
      if (!a[x.serviceGroup]) {
        // eslint-disable-next-line no-param-reassign
        a[x.serviceGroup] = {
          adapterType: 'service-groups',
          id: x.serviceGroup,
          host: transformHost(x.systemSettings?.targetHost) || (agentsHosts && agentsHosts[x.id]),
          // TODO think what to do with the SG status
          status: x.status,
          buildVersion: x.buildVersion,
          mustRecordJsCoverage: false,
        };
      }

      if (x.agentType.toLowerCase() === AgentType.JAVA_SCRIPT) {
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

function createAdaptersFromInfo(data: AdapterInfo[], backend: BackendCreator) {
  return data.reduce((a, x) => ({ ...a, [x.host]: createAdapter(x, backend) }), {});
}

function notifySubscribers(subscribers: Record<string, SubNotifyFunction>, data: unknown) {
  objectPropsToArray<SubNotifyFunction>(subscribers).forEach(notify => notify(data));
}

function createPortUpdater(port: chrome.runtime.Port, resource: string): SubNotifyFunction {
  return (data: any) => {
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
      // TODO that could mask other errors
      // quick hack to handle situations when debugger was already disconnected
      try {
        await jsCoverageRecorder.cancel(sender);
      } catch (e) {
        console.log('WARNING', 'failed to disconnect debugger:', e);
      }
      await backendApi.cancelTest(sessionId);
    },
  };
}
