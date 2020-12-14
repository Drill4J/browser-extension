import { browser, WebRequest } from 'webextension-polyfill-ts';

export function setupResponseInterceptor() {
  const interceptor = ({ responseHeaders = [], initiator = '' }: WebRequest.OnHeadersReceivedDetailsType & { initiator?: string }) => {
    headerHandlers.forEach(handler => {
      const matchedHeader = responseHeaders.find(x => x.name === handler.name);
      if (matchedHeader) handler.cb(matchedHeader.value, initiator);
    });
  };

  const headerHandlers: HeaderHandler[] = [];

  browser.webRequest.onHeadersReceived.addListener(
    interceptor,
    {
      urls: ['*://*/*'], // TODO that could be narrowed with user-defined settings ?
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

type HeaderHandlerCb = (value: any, initiator: string) => any;
