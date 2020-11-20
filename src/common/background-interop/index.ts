import { connect } from './background-connect';

const connection = connect();

export async function sendMessage<T>(message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    // reference https://developer.chrome.com/extensions/runtime#method-sendMessage
    chrome.runtime.sendMessage('', message, {}, (response) => {
      if (response?.error) {
        reject(response.error);
      }
      resolve(response);
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

export async function getHostInfo() {
  return sendMessage<Record<string, any>>({ type: 'GET_HOST_INFO' });
}

export function subscribeToAgent(handler: (...params: unknown[]) => void, options?: unknown) {
  const unsubscribe = connection.subscribe('agent', handler, options);
  return unsubscribe;
}

export function subscribeToSession(handler: (...params: unknown[]) => void) {
  const unsubscribe = connection.subscribe('session', handler);
  return unsubscribe;
}

export function subscribeToActiveScope(handler: (...params: unknown[]) => void) {
  const unsubscribe = connection.subscribe('scope', handler);
  return unsubscribe;
}
