import { browser, WebRequest, Runtime } from 'webextension-polyfill-ts';
import * as testRunner from './test-runner';

const ready = startup(); // see setupRuntimeMessageListener

setupRuntimeMessageListener(messageRouter(ready, testRunner));

async function startup() {
  // setup storage wrapper / get initial values etc
  setupRequestHeaderInjector();
  setupResponseHeaderMonitor();
}

function messageRouter(testRunner) {
  return async (type, payload) => {
    switch (type) {
      case 'IS_JS_RECORDING_IN_PROGRESS':
        throw new Error('IS_JS_RECORDING_IN_PROGRESS N/A');

      case 'START_TEST':
        return testRunner.startTest(payload);

      case 'dumb_code_example':
        // doStuff();
        // all cases must return to avoid unhandled errors
        // to enforce that "No-op" error is thrown if code block does otherwise
        break;

      case 'STOP_TEST':
        throw new Error('STOP_TEST N/A');

      case 'CANCEL_TEST':
        throw new Error('CANCEL_TEST N/A');

      default:
        throw new Error(`Received messaged with unknown type: ${type}`);
    }
    throw new Error('No-op');
  };
}

function setupRuntimeMessageListener(ready, handler) {
  chrome.runtime.onMessage.addListener((message, sender, callback) => {
    (async () => {
      const { type, payload } = message;
      try {
        // await ready; // do not answer requests until startup setup is completed
        const data = await handler(type, payload);
        callback(data);
      } catch (e) {
        callback({ error: `Unexpected error occurred: ${e.message}` });
      }
    })();
    return true;
  });
}

function setupRequestHeaderInjector() {
  browser.webRequest.onBeforeSendHeaders.addListener(
    requestInteceptor,
    {
      urls: ['*://*/*'],
    },
    ['blocking', 'requestHeaders'],
  );

  function requestInteceptor({ requestHeaders = [], initiator = '' }: WebRequest.OnBeforeSendHeadersDetailsType & { initiator?: string}) {
    const requestHost = getHost(initiator);

    if (!requestHost) {
      return { requestHeaders };
    }

    const { sessionId = '', testName = '', isActive = false } = configMap.domains ? configMap.domains[requestHost] || {} : {};
    if (isActive) {
      requestHeaders.push({ name: 'drill-session-id', value: sessionId });
      requestHeaders.push({ name: 'drill-test-name', value: testName });
    }
    return { requestHeaders };
  }
}
