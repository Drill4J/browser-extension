import * as React from 'react';
import * as ReactDom from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { transformHost } from './common/util/transform-host';
import * as bgInterop from './common/background-interop';
import { App } from './content-script';
import './content.scss';

init();
async function init() {
  await bgInterop.ready();
  const hostInfo = await bgInterop.getHostInfo();
  const host = transformHost(window.location.href);
  if (hostInfo) {
    tryRenderWidget(host);
  }
  browser.storage.onChanged.addListener((changes) => {
    console.log('browser.storage.onChanged', changes);
    tryRenderWidget(host);
    positionWidget(host);
  });
}

async function tryRenderWidget(host: string) {
  const localStorage = await browser.storage.local.get();
  (localStorage && localStorage[host] && localStorage[host].isWidgetVisible)
    ? renderWidget(host)
    : removeWidget();
}

let widgetIframe: HTMLIFrameElement | null;
function renderWidget(host: string) {
  if (widgetIframe) return;
  const iframe = document.createElement('iframe');
  widgetIframe = iframe;
  document.body.appendChild(iframe);
  positionWidget(host);
  if (!iframe.contentDocument) throw new Error('failed to create iframe or it got deleted');

  const root = iframe.contentDocument.createElement('div');
  root.id = 'drill-widget-root';

  iframe.contentDocument.body.appendChild(root);
  injectCss(iframe.contentDocument, 'content.css');
  injectCss(iframe.contentDocument, 'uikit.css');
  injectFonts(iframe.contentDocument);
  ReactDom.render(React.createElement(App, { host }), root);
}

// TODO implement storage access method to avoid passing host around
async function positionWidget(host: string) {
  const localStorage = await browser.storage.local.get();
  const corner = localStorage[host].corner || 'top-left';
  const expanded = localStorage[host].expanded || false;
  const className = `drill-widget-iframe drill-widget-iframe-position__${corner} drill-widget-iframe-expanded__${expanded}`;
  if (!widgetIframe) return;

  widgetIframe.className = className;
}

function removeWidget() {
  if (!widgetIframe) return;
  bgInterop.unsubscribeAll();
  document.body.removeChild(widgetIframe);
  widgetIframe = null;
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
