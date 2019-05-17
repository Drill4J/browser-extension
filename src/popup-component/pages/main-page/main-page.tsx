/* eslint-disable react/prop-types */
import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';

import { Badge, Icons } from '../../../components';
import { Panel } from '../../../layouts';
import { CompoundLabel } from './compound-label';
import { useLocalStorage } from '../../../hooks';

import styles from './main-page.module.scss';

const mainPage = BEM(styles);

export const MainPage = withRouter(
  mainPage(({ className, history: { push } }) => {
    const { isActive = false } = useLocalStorage('isActive') || {};

    return (
      <div className={className}>
        <Header>
          <Panel>
            <Icons.Planet /> <AgentName>Agent Name</AgentName>
          </Panel>
          <Badge text="Online" />
        </Header>
        <ActionsList>
          <ActionItem
            onClick={() => push(`/manual-testing/${isActive ? 'in-progress' : 'start-recording'}`)}
          >
            <IconWrapper align="center" active={isActive}>
              <Icons.Mouse />
            </IconWrapper>
            <CompoundLabel firstLabel="Manual testing" secondLabel="For Code Coverage plugin" />
            <RedirectIcon>
              <Icons.Expander />
            </RedirectIcon>
          </ActionItem>
        </ActionsList>
      </div>
    );
  }),
);

const Header = mainPage.header('div');
const AgentName = mainPage.agentName('div');
const ActionsList = mainPage.actionsList('div');
const ActionItem = mainPage.actionItem(Panel);
const IconWrapper: React.ComponentType<any> = mainPage.iconWrapper(Panel);
const RedirectIcon = mainPage.redirectIcon('div');
