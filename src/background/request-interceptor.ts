import { browser, WebRequest } from 'webextension-polyfill-ts';
import { transformHost } from '../common/util/transform-host';
import { SessionStatus } from '../common/enums';
import { SessionData } from './types';

export function setupRequestInterceptor(sessionsStorage: Record<string, SessionData>) {
  const interceptor = (req: WebRequest.OnBeforeSendHeadersDetailsType) => {
    const { requestHeaders = [], url } = req;
    const { initiator } = req as any; // typings lack this field

    /*
      initiator - page address the request was made _from_
      url  - resource address request was made _to_
      Cases:
        1. initiator === url        same origin request (e.g. FE app & BE API on same host)
        2. initiator !== url        cross-origin request (FE app on one host, BE API is on the other)
        3. no initiator, url only   request was made directly from browser's address line
    */
    const host = transformHost(initiator || url);

    const session = sessionsStorage[host];
    if (session && session.status === SessionStatus.ACTIVE) {
      requestHeaders.push({ name: 'drill-session-id', value: session.sessionId });
      requestHeaders.push({ name: 'drill-test-name', value: session.testName });
    }
    return { requestHeaders };
  };
  browser.webRequest.onBeforeSendHeaders.addListener(
    interceptor,
    {
      urls: ['<all_urls>'],
    },
    ['blocking', 'requestHeaders'],
  );

  return () => browser.webRequest.onBeforeSendHeaders.removeListener(interceptor);
}
