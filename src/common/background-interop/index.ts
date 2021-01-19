import { connect } from './background-connect';
import type { BackgroundConnection } from './types';

let connection: BackgroundConnection;
let connectionEstablished = connect(
  (x: BackgroundConnection) => {
    console.log('Connection established!', Date.now());
    connection = x;
  },
  (reconnectPromise) => {
    console.log('Reconnecting...', Date.now());
    connectionEstablished = reconnectPromise;
  },
);

export async function ready() { return connectionEstablished; }

export async function subscribeToAgent(handler: (...params: unknown[]) => void, options?: unknown) {
  await connectionEstablished;
  const unsubscribe = connection.subscribe('agent', handler, options);
  return unsubscribe;
}

export async function subscribeToSession(handler: (...params: unknown[]) => void) {
  await connectionEstablished;
  const unsubscribe = connection.subscribe('session', handler);
  return unsubscribe;
}

export async function subscribeToActiveScope(handler: (...params: unknown[]) => void) {
  await connectionEstablished;
  const unsubscribe = connection.subscribe('scope', handler);
  return unsubscribe;
}

export async function subscribeToBackendConnectionStatus(handler: (...params: unknown[]) => void) {
  await connectionEstablished;
  const unsubscribe = connection.subscribe('backend-connection-status', handler);
  return unsubscribe;
}

export async function unsubscribeAll() {
  connection.unsubscribeAll();
}

async function sendMessage<T>(message: unknown): Promise<T> {
  // chrome.runtime.sendMessage doesn't really utilize a port connection
  // that "connectionEstablished" promise is used merely as an indication of the background script readyness to accept messages
  await connectionEstablished;
  return new Promise((resolve, reject) => {
    // reference https://developer.chrome.com/extensions/runtime#method-sendMessage
    chrome.runtime.sendMessage('', message, {}, (response) => {
      if (response?.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}

export async function startTest(testName: string) {
  return sendMessage<string>({ type: 'START_TEST', payload: testName });
}

export async function stopTest() {
  return sendMessage<void>({ type: 'STOP_TEST' });
}

export async function cancelTest() {
  return sendMessage<void>({ type: 'CANCEL_TEST' });
}

export async function cleanupTestSession() {
  return sendMessage<void>({ type: 'CLEANUP_TEST_SESSION' });
}

export async function reactivateTestSession() {
  return sendMessage<void>({ type: 'REACTIVATE_TEST_SESSION' });
}

export async function getHostInfo() {
  return sendMessage<Record<string, any>>({ type: 'GET_HOST_INFO' });
}
