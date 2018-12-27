import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import cookie from 'cookie';
import { Widget } from '../../components/widget';

const ResponsiveGridLayout = WidthProvider(Responsive);
const SESSION_ID_COOKIE_KEY = 'DrillSessionId';
const SESSION_HOST_COOKIE_KEY = 'DrillSocketHost';
const cookies = cookie.parse(document.cookie);
const sessionId = cookies[SESSION_ID_COOKIE_KEY];
const sessionHost = cookies[SESSION_HOST_COOKIE_KEY];
const gridLayoutProps = {
  compactType: null,
  isResizable: false,
  rowHeight: 100,
};

export const Content = () => (
  <ResponsiveGridLayout {...gridLayoutProps}>
    <div key="widget" data-grid={{ x: 0, y: 0, w: 1, h: 1 }}>
      <Widget sessionId={sessionId} sessionHost={sessionHost} />
    </div>
  </ResponsiveGridLayout>
);
