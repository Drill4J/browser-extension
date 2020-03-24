import * as React from 'react';
import { BEM, tag } from '@redneckz/react-bem-helper';
import { browser } from 'webextension-polyfill-ts';
import {
  Icons, Panel, PanelSpread, Button,
} from '@drill4j/ui-kit';

import { AgentConfig } from 'types/agent-config';
import { UnavailablePage } from '../unavailable-page';
import { useAgentInfo, useLocalStorage } from '../../../hooks';
import { AgentStatus } from './agent-status';
import { withConfigs } from '../../with-configs';
import { login } from '../../api';

import styles from './main-page.module.scss';

interface Props {
  className?: string;
  configs: AgentConfig;
}

const mainPage = BEM(styles);

export const MainPage = withConfigs(mainPage(({ className, configs: { drillAdminUrl, drillAgentId } = {} }: Props) => {
  const { name = '', status } = useAgentInfo(drillAdminUrl, drillAgentId) || {};
  const { active = false } = useLocalStorage<boolean>('active') || {};

  React.useEffect(() => {
    drillAdminUrl && login();
  }, [drillAdminUrl]);

  return (
    <div className={className}>
      {drillAdminUrl ? (
        <>
          <Header>
            <Panel>
              <Icons.Planet />
              <AgentName>{name}</AgentName>
            </Panel>
            <AgentStatus status={status} />
          </Header>
          <Content>
            <div>Drill4J web widget allows you to record your test sessions and see test coverage results in real time.</div>
            <ActionsPanel>
              <Button type="primary" size="large" onClick={() => browser.storage.local.set({ active: !active })}>
                {active ? 'Close widget' : 'Run widget'}
              </Button>
              <Button type="secondary" size="large" onClick={() => browser.runtime.openOptionsPage()}>
                Widget settings
              </Button>
            </ActionsPanel>
          </Content>
          <PanelSpread />
          <Footer>
            Visit&nbsp;
            <Link
              href="http://drill4j.github.io"
              rel="noopener noreferrer"
              target="_blank"
            >
              Drill4J
            </Link>
            &nbsp;for additional info about the project.
          </Footer>
        </>
      ) : <UnavailablePage />}
    </div>
  );
}));

const Header = mainPage.header('div');
const AgentName = mainPage.agentName('div');
const Content = mainPage.content('div');
const Footer = mainPage.footer(Panel);
const ActionsPanel = mainPage.actionsPanel(Panel);
const Link = mainPage.link(
  tag('a')({ href: '', rel: '', target: '' } as { href: string; rel: string; target: string; children: React.ReactNode}),
);
