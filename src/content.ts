import * as React from 'react';
import { render } from 'react-dom';
import { browser } from 'webextension-polyfill-ts';

import { AgentConfig } from 'types/agent-config';
import { configureAxios } from './common/connection';
import { App } from './content-script';
import './content.css';

let configMap: { [host: string]: AgentConfig } = {};

browser.storage.local.get().then((value) => {
  if (value) {
    configMap = value;
    configMap[window.location.host] && configMap.active && renderWidget();
  }
});

browser.storage.onChanged.addListener(() => {
  browser.storage.local.get().then((value) => {
    configMap = value;
    configMap.active ? renderWidget() : removeWidget();
  });
});

function renderWidget() {
  const oldWidget = document.querySelector('#drill-widget-root');
  if (!oldWidget) {
    const root = document.createElement('div');
    root.id = 'drill-widget-root';
    document.body.appendChild(root);
    injectFonts();
    const { drillAdminUrl = '' } = configMap[window.location.host];
    configureAxios(drillAdminUrl).then(() => render(React.createElement(App), root));
  }
}

function removeWidget() {
  const root = document.querySelector('#drill-widget-root');
  root && root.remove();
}

function injectFonts() {
  const fonts = document.createElement('style');
  fonts.type = 'text/css';
  fonts.textContent = `@font-face { font-family: OpenSans; src: url("${
    browser.extension.getURL('OpenSans-Regular.ttf')
  }"); } @font-face { font-family: OpenSans-Semibold; src: url("${
    browser.extension.getURL('OpenSans-SemiBold.ttf')
  }"); }`;
  document.head.appendChild(fonts);
}
