import * as React from 'react';
import { render } from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { transformHost } from './common/util/transform-host';
import * as bgInterop from './common/background-interop';
import { App } from './content-script';
import './content.css';

init();
async function init() {
  const hostInfo = await bgInterop.getHostInfo();
  const host = transformHost(window.location.href);
  if (hostInfo) {
    tryRenderWidget(host);
  }
  browser.storage.onChanged.addListener((changes) => {
    console.log('browser.storage.onChanged', changes);
    tryRenderWidget(host);
  });
}

async function tryRenderWidget(host: string) {
  const localStorage = await browser.storage.local.get();
  (localStorage && localStorage[host] && localStorage[host].isWidgetVisible)
    ? renderWidget(host)
    : removeWidget();
}

function renderWidget(host: string) {
  const oldWidget = document.querySelector('#drill-widget-root');
  if (!oldWidget) {
    const root = document.createElement('div');
    root.id = 'drill-widget-root';
    document.body.appendChild(root);
    injectFonts();
    render(React.createElement(App, { host }), root);
  }
}

function removeWidget() {
  const root = document.querySelector('#drill-widget-root');
  root && root.remove();
}

function injectFonts() {
  const fonts = document.createElement('style');
  fonts.type = 'text/css';
  fonts.textContent = `
  @font-face {
      font-family: OpenSans;
      src: url("${browser.extension.getURL('OpenSans-Regular.ttf')}");
  }
  @font-face {
      font-family: OpenSans-Semibold;
      src: url("${browser.extension.getURL('OpenSans-SemiBold.ttf')}");
  }`;
  document.head.appendChild(fonts);
}
