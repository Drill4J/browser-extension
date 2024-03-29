import * as React from 'react';
import * as ReactDom from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { transformHost } from './common/util/transform-host';
import * as bgInterop from './common/background-interop';
import { App } from './content-script';
import './content.scss';

init().catch((error) => {
  console.warn('Drill4 Browser Extension: failed to initialize:', error);
  // eslint-disable-next-line no-alert
  alert('Drill4 Browser Extension: failed to initialize. Press F12 to open developer tools and see error in Console tab');
});

async function init() {
  let widget: HTMLIFrameElement | null;
  await bgInterop.ready();
  const hostInfo = await bgInterop.getHostInfo();
  const host = transformHost(window.location.href);

  if (hostInfo && (await isWidgetVisible(host))) {
    widget = await injectIframe(host);
  }

  // TODO remove listener on widget close
  browser.storage.onChanged.addListener(async (changes) => {
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

async function injectIframe(host: string): Promise<HTMLIFrameElement | never> {
  const iframe = document.createElement('iframe');
  iframe.classList.add('drill-widget-iframe');
  await positionIframe(host, iframe);

  // HACK to prevent widget layout "flickering"
  // it avoids displaying widget before it's fully is rendered
  iframe.classList.add('drill-widget-iframe--hidden');
  setTimeout(() => iframe.classList.remove('drill-widget-iframe--hidden'), 200);

  getWidgetMountNode().appendChild(iframe);
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
  iframe.classList.remove('drill-widget-iframe-position__bottom');
  iframe.classList.remove('drill-widget-iframe-position__top');

  iframe.classList.add(`drill-widget-iframe-position__${corner}`);
  if (!localStorage[host].corner) {
    await browser.storage.local.set({ [host]: { ...localStorage[host], corner: 'bottom' } });
  }
}

function removeIframe(iframe: HTMLIFrameElement) {
  if (!iframe) return;
  bgInterop.unsubscribeAll();
  getWidgetMountNode().removeChild(iframe);
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

function getWidgetMountNode() {
  if (!document.hasChildNodes()) throw new Error('page has no child nodes. Unable to mount/unmount widget');

  if (document.body?.tagName === 'BODY') return document.body;
  console.warn('no <body> tag found');

  if (document.documentElement) {
    console.warn('using document.documentElement as widget mount point', document.documentElement);
    return document.documentElement;
  }

  console.warn('using the first child node as a widget mount point', document.childNodes[0]);
  return document.childNodes[0];
}
