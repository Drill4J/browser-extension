import { browser, WebRequest } from 'webextension-polyfill-ts';
import { transformHost } from '../common/util/transform-host';
import { SessionStatus } from '../common/enums';
import { SessionData } from './types';

export function setupRequestInterceptor(sessionsStorage: Record<string, SessionData>) {
  const interceptor = (details: WebRequest.OnBeforeRequestDetailsType) => {
    const result: chrome.webRequest.BlockingResponse = {};
    const { url } = details;
    const host = transformHost(url);

    // skip checks for empty hosts
    if (!host) return result; // TODO probably can omit url and just return {}

    // no active session
    const session = sessionsStorage[host];
    if (!session || session.status !== SessionStatus.ACTIVE) return {}; // TODO probably can omit url and just return {}

    // already added
    const parsedUrl = new URL(url);
    if (parsedUrl.search.indexOf('drill-session-id') > -1 && parsedUrl.search.indexOf('drill-test-name') > -1) {
      return result;
    }

    // check if other query params are present and format accordingly
    if (parsedUrl.search) {
      parsedUrl.search = `${parsedUrl.search}&drill-session-id=${session.sessionId}&drill-test-name=${session.testName}`;
    } else {
      parsedUrl.search = `?drill-session-id=${session.sessionId}&drill-test-name=${session.testName}`;
    }
    result.redirectUrl = parsedUrl.toString();

    return result;
  };

  chrome.webRequest.onBeforeRequest.addListener(
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    interceptor,
    {
      urls: ['<all_urls>'],
    },
    ['blocking'],
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return () => chrome.webRequest.onBeforeRequest.removeListener(interceptor);
}
