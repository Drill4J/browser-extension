import { browser, WebRequest } from 'webextension-polyfill-ts';
import { transformHost } from '../common/util/transform-host';
import { SessionStatus } from '../common/enums';
import { SessionData } from './types';

export function setupRequestInterceptor(sessionsStorage: Record<string, SessionData>) {
  const interceptor = ({ requestHeaders = [], url }: WebRequest.OnBeforeSendHeadersDetailsType) => {
    const host = transformHost(url);
    if (!host) return { requestHeaders };

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
