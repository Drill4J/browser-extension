import chromeApi from '../chrome-api';
import type { SubNotifyFunction } from '../../background/types';
import { repeatAsync } from '../util/repeat-async';
import type { BackgroundConnection, ConnectCallback, DisconnectCallback } from './types';

export async function connect(connectCb: ConnectCallback, disconnectCb: DisconnectCallback) {
  const repeatUntilConnect = () => repeatAsync(async () => {
    const connection = await connectPort(() => {
      const reconnectPromise = repeatUntilConnect();
      disconnectCb(reconnectPromise);
    });
    connectCb(connection);
    return connection;
  });
  return repeatUntilConnect();
}

async function asyncChromeRuntimeConnect(): Promise<chrome.runtime.Port> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const connectInfo: chrome.runtime.ConnectInfo = {};

    const isRunningInPopup = window.location.protocol === 'chrome-extension:';
    if (isRunningInPopup) {
      const activeTab = await chromeApi.getActiveTab();
      connectInfo.name = `${activeTab?.id}-popup`;
    }
    const port = chrome.runtime.connect(connectInfo);
    // chrome.runtime.connect has no callback
    // so chrome.runtime.lastError must be checked in port.onDisconnect
    // reference https://bugs.chromium.org/p/chromium/issues/detail?id=836370#c11
    const disconnectHandler = () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      }
    };
    port.onDisconnect.addListener(disconnectHandler);

    // hack-ish way of detecting if chrome.runtime.connect returned connected port
    // chrome.runtime.connect is successful, if port.onDisconnect was not called "immediately"
    // hence, the timeout
    setTimeout(() => {
      port.onDisconnect.removeListener(disconnectHandler);
      resolve(port);
    }, 100);
  });
}

type UnsubscribeFunction = () => void;
async function connectPort(disconnectCb: () => void): Promise<BackgroundConnection> {
  const port = await asyncChromeRuntimeConnect();
  const subs: Record<string, SubNotifyFunction[]> = {};
  let unsubscribeFunctions: UnsubscribeFunction[] = [];

  const messageHandler = (message: any) => {
    const handlers = subs[message.resource];
    if (!Array.isArray(handlers) || handlers.length === 0) {
      console.log('No handler for resource', message.resource);
      return;
    }
    // console.log('PORT RECEIVED MESSAGE', message, 'NOTIFY SUBS', handlers);
    handlers.forEach(handler => handler(message.payload));
  };

  const disconnectHandler = () => {
    // console.log('DISCONNECT disconnectHandler');
    if (port.onMessage.hasListener(messageHandler)) {
      port.onMessage.removeListener(messageHandler);
    }
    port.onDisconnect.removeListener(disconnectHandler);
    disconnectCb();
  };

  port.onMessage.addListener(messageHandler);
  port.onDisconnect.addListener(disconnectHandler);

  return {
    subscribe: (resource: string, handler: (...params: any) => any, options?: any) => {
      // console.log('BG CONNECT SUBSCRIBE', resource, handler, options);
      if (!Array.isArray(subs[resource])) {
        subs[resource] = [];
      }
      const isSubscriptionAlreadyExists = subs[resource].length > 0;
      subs[resource].push(handler);

      if (!isSubscriptionAlreadyExists) {
        port.postMessage({ type: 'SUBSCRIBE', resource, options });
      }

      const unsubscribe = () => {
        // console.log('BG CONNECT UNSUB', resource, options);

        const index = subs[resource].findIndex(x => x === handler);
        subs[resource].splice(index, 1); // TODO Does it look kinda iffy?

        const noMoreSubsLeft = subs[resource].length === 0;
        if (noMoreSubsLeft) {
          port.postMessage({ type: 'UNSUBSCRIBE', resource, options });
        }
      };
      unsubscribeFunctions.push(unsubscribe);
      return unsubscribe;
    },
    unsubscribeAll() {
      unsubscribeFunctions.forEach(x => x());
      unsubscribeFunctions = [];
    },
  };
}
