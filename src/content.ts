import * as React from 'react';
import * as ReactDom from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { transformHost } from './common/util/transform-host';
import * as bgInterop from './common/background-interop';
import { App } from './content-script-2';
import './content.scss';

init();

async function init() {
  let widget: HTMLIFrameElement | null;
  await bgInterop.ready();
  const hostInfo = await bgInterop.getHostInfo();
  const host = transformHost(window.location.href);

  if (hostInfo && await isWidgetVisible(host)) {
    widget = injectIframe(host);
  }

  // TODO remove listener on widget close
  browser.storage.onChanged.addListener(async (changes) => {
    console.log('browser.storage.onChanged', changes);

    const shouldHideWidget = !(await isWidgetVisible(host));
    if (shouldHideWidget && widget) {
      removeIframe(widget);
      widget = null;
      return;
    }

    if (!widget) return;
    positionIframe(host, widget);
  });
}

async function isWidgetVisible(host: string) {
  const localStorage = await browser.storage.local.get();
  return localStorage && localStorage[host] && localStorage[host].isWidgetVisible;
}

function injectIframe(host: string): HTMLIFrameElement | never {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  positionIframe(host, iframe);
  if (!iframe.contentDocument) throw new Error('failed to create iframe or it got deleted');

  const root = iframe.contentDocument.createElement('div');
  root.id = 'drill-widget-root';

  iframe.contentDocument.body.appendChild(root);
  injectCss(iframe.contentDocument, 'content.css');
  injectCss(iframe.contentDocument, 'uikit.css');
  injectFonts(iframe.contentDocument);
  ReactDom.render(React.createElement(App, { host }), root);
  return iframe;
}

// TODO implement storage access method to avoid passing host around
async function positionIframe(host: string, iframe: HTMLIFrameElement) {
  const localStorage = await browser.storage.local.get();
  const corner = localStorage[host].corner || 'bottom';
  const className = `drill-widget-iframe drill-widget-iframe-position__${corner} `;
  if (!iframe) return;

  // eslint-disable-next-line no-param-reassign
  iframe.className = className;
}

function removeIframe(iframe: HTMLIFrameElement) {
  if (!iframe) return;
  bgInterop.unsubscribeAll();
  document.body.removeChild(iframe);
}

function injectCss(targetDocument: Document, filename: string) {
  const style = targetDocument.createElement('link');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('type', 'text/css');
  style.setAttribute('href', browser.extension.getURL(filename));
  targetDocument.head.appendChild(style);
}

function injectFonts(targetDocument: Document) {
  const fonts = targetDocument.createElement('style');
  fonts.type = 'text/css';
  fonts.textContent = `
  @font-face {
      font-family: OpenSans;
      src: url("${browser.extension.getURL('OpenSans-Regular.ttf')}");
  }
  @font-face {
      font-family: OpenSans-Semibold;
      src: url("${browser.extension.getURL('OpenSans-SemiBold.ttf')}");
  }
  @font-face {
      font-family: OpenSans-Light;
      src: url("${browser.extension.getURL('OpenSans-Light.ttf')}");
  }
  @font-face {
      font-family: OpenSans-Bold;
      src: url("${browser.extension.getURL('OpenSans-Bold.ttf')}");
  }`;
  targetDocument.head.appendChild(fonts);
}
