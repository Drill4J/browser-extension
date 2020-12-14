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

import { SessionStatus, AgentType } from './enums';
import { setupResponseInterceptor } from './response-interceptor';
import { repeatAsync } from '../common/util/repeat-async';
import { setupRequestInterceptor } from './request-interceptor';
import { objectPropsToArray } from '../common/util/object-props-to-array';

init();
async function init() {
  const responseInterceptorsCleanup = setupResponseInterceptors();

  let backend: any;
  let connectionEstablished = connect(
    (x: any) => {
      backend = x;
      console.log('Connection established!', Date.now());
    },
    (reconnectPromise: any) => {
      console.log('Reconnecting...', Date.now());
      connectionEstablished = reconnectPromise;
    },
  );

  // console.log('ready to start');
  // start(backend);
}

export async function connect(connectCb: any, disconnectCb: any) {
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
      console.log('admin', error);
      disconnectCb(error);
    },
    (data: any) => {
      console.log('admin complete', data);
    },
  );
  console.log('connected to backend', backendAddress);
  return backend;
}

function setupResponseInterceptors() {
  const responseInterceptor = setupResponseInterceptor();

  responseInterceptor.add('drill-admin-url', async (backendAddress) => {
    await localStorageUtil.save({ backendAddress });
    responseInterceptor.remove('drill-admin-url');
  });

  const interceptedAgentData: Record<string, string> = {};
  const agentOrGroupHandler = async (agentOrGroupId: string, host: string) => {
    interceptedAgentData[host] = agentOrGroupId;
    console.log('interceptedAgentData', agentOrGroupId, host, interceptedAgentData);
  };

  responseInterceptor.add('drill-agent-id', agentOrGroupHandler);
  responseInterceptor.add('drill-group-id', agentOrGroupHandler);

  return () => responseInterceptor.cleanup();
}

async function start(backend: BackendCreator) {
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

  const unsubscribeFromAdmin = backend.subscribeAdmin('/api/agents', (data: any) => {
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

    adapters = createAdaptersFromInfo(newInfo, backend);
  });

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
    });

    port.onMessage.addListener(portMessageHandler);
  };
  chrome.runtime.onConnect.addListener(runtimeConnectHandler);

  const requestInterceptorCleanup = setupRequestInterceptor(sessionsData);

  const router = createMessageRouter();

  router.add('START_TEST', async (sender: chrome.runtime.MessageSender, testName: string) => {
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

  router.add('STOP_TEST', async (sender: chrome.runtime.MessageSender) => {
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

  router.add('CANCEL_TEST', async (sender: chrome.runtime.MessageSender) => {
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

  router.add('CLEANUP_TEST_SESSION', async (sender: chrome.runtime.MessageSender) => {
    const host = transformHost(sender.url);
    delete sessionsData[host];
    notifySubscribers(sessionSubs[host], sessionsData[host]); // FIXME
  });

  // FIXME rename that to getIsHostAssociatedWithAgent
  router.add('GET_HOST_INFO', async (sender: chrome.runtime.MessageSender) => {
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
      mustRecordJsCoverage: x.agentType.toLowerCase() === AgentType.JAVA_SCRIPT,
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
