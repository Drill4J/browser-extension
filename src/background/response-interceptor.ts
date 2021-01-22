import { browser, WebRequest } from 'webextension-polyfill-ts';

export function setupResponseInterceptor() {
  const interceptor = ({ responseHeaders = [], url }: WebRequest.OnHeadersReceivedDetailsType) => {
    headerHandlers.forEach(handler => {
      const matchedHeader = responseHeaders.find(x => x.name.toLowerCase() === handler.name.toLowerCase());
      if (matchedHeader) handler.cb(matchedHeader.value, url);
    });
  };

  const headerHandlers: HeaderHandler[] = [];

  browser.webRequest.onHeadersReceived.addListener(
    interceptor,
    {
      // why not urls: ['*://*/*'],
      // <all_urls> - matches all responses, including those that have "Initiator - Other" in DevTools/Network
      // reference https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns#%3Call_urls%3E
      urls: ['<all_urls>'],
    },
    ['responseHeaders'],
  );

  return {
    add(name: string, cb: HeaderHandlerCb) {
      headerHandlers.push({ name, cb });
    },
    remove(headerName: string) {
      const index = headerHandlers.findIndex(x => x.name === headerName);
      if (index !== -1) {
        headerHandlers.splice(index, 1);
      }
    },
    cleanup() {
      browser.webRequest.onHeadersReceived.removeListener(interceptor);
      headerHandlers.length = 0;
    },
  };
}

type HeaderHandler = {
  name: string;
  cb: HeaderHandlerCb;
}

type HeaderHandlerCb = (value: any, url: string) => any;
