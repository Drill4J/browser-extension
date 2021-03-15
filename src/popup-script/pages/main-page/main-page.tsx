import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Button } from '@drill4j/ui-kit';
import { browser } from 'webextension-polyfill-ts';

import { AgentStatus as Status } from '../../../common/enums';
import { AgentNotFound } from './agent-not-found';
import {
  useHostLocalStorage, useAgentOnActiveTab, useActiveTab,
} from '../../../hooks';
import { AgentStatus } from './agent-status';
import { Logo } from '../logo';
import * as bgInterop from '../../../common/background-interop';

import styles from './main-page.module.scss';

interface Props {
  className?: string;
}

const mainPage = BEM(styles);

export const MainPage = mainPage(({ className }: Props) => {
  const activeTab = useActiveTab();
  const { data: agent, isLoading, isError } = useAgentOnActiveTab();

  const { host = '', status } = agent || {};

  const localStorage = useHostLocalStorage(host) || {};
  const { [host]: hostStorage } = localStorage;

  const hasAssociatedAgent = !isLoading && !isError && Boolean(agent);
  const isWidgetVisible = hostStorage?.isWidgetVisible;

  return (
    <div className={className}>
      { hasAssociatedAgent ? (
        <div className="h-100">
          <Header className="d-flex align-items-center px-4 gx-2">
            <Logo viewBox="0 0 16 16" width={24} height={16} />
            <div title={agent?.id} className="text-ellipsis fs-14 lh-20 bold">{agent?.id}</div>
            <AgentStatus className="ml-auto" status={status} />
          </Header>
          <div className="d-flex flex-column justify-content-center align-items-center h-100 px-4 gy-6">
            <span className="text-center">
              {status === Status.ONLINE && (
                <span>
                  You&#39;re all set now.&nbsp;
                  { isWidgetVisible
                    ? 'You can use the widget \n for manual testing.'
                    : 'Click "Open Widget" \n to start manual testing.' }
                </span>
              )}
              {status === Status.NOT_REGISTERED && (
                <span>Agent is not registered. Please complete registration in the Admin Panel</span>
              )}
              {(status === Status.OFFLINE || status === Status.BUSY) && (
                <span>
                  Agent is currently&nbsp;
                  {status.toLowerCase()}
                  . In order to perform testing the agent has to be online.
                </span>
              )}
            </span>
            { !isWidgetVisible ? (
              <Button
                className="mx-auto"
                type="primary"
                size="large"
                disabled={status !== Status.ONLINE}
                onClick={
                  async () => {
                    try {
                      await bgInterop.openWidget(activeTab);
                    } catch (e) {
                      console.log(e?.message || 'Something happened on the backend');
                    }
                    await browser.storage.local.set({ [host]: { ...hostStorage, isWidgetVisible: true } });
                    injectContentScript(activeTab);
                  }
                }
              >
                Open Widget
              </Button>
            ) : (
              <Button
                className="mx-auto"
                type="secondary"
                size="large"
                onClick={async () => {
                  try {
                    await bgInterop.hideWidget(activeTab);
                  } catch (e) {
                    console.log(e?.message || 'Something happened on the backend');
                  }
                  await browser.storage.local.set({ [host]: { ...hostStorage, isWidgetVisible: false } });
                }}
              >
                Hide Widget
              </Button>
            )}
          </div>
        </div>
      ) : <AgentNotFound /> }
    </div>
  );
});

const Header = mainPage.header('div');

function injectContentScript(activeTab: chrome.tabs.Tab | undefined) {
  if (!activeTab?.id) return;
  const activeTabId = activeTab?.id;
  chrome.tabs.insertCSS(activeTabId, { file: 'iframe.css' }, () => {
    chrome.tabs.executeScript(activeTabId, { file: 'content.bundle.js' }, () => {
    });
  });
}
