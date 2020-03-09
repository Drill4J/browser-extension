import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { useHistory } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import {
  Icons, Panel, Button, OverflowText,
} from '@drill4j/ui-kit';
import axios from 'axios';

import { useAgentConfig } from '../../../../hooks';
import { AgentConfig } from '../../../../types/agent-config';
import { Timer } from './timer';

import styles from './in-progress.module.scss';

interface Props {
  className?: string;
}

const inProgress = BEM(styles);

function finishRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false } });
  const { drillAgentId, drillGroupId, sessionId } = config;
  const requestURL = `${drillAgentId ? `/agents/${drillAgentId}` : `/service-groups/${drillGroupId}`}/plugins/test2code/dispatch-action`;
  axios.post(requestURL, {
    type: 'STOP',
    payload: { sessionId },
  });
}

function cancelRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false } });
  const { drillAgentId, drillGroupId, sessionId } = config;
  const requestURL = `${drillAgentId ? `/agents/${drillAgentId}` : `/service-groups/${drillGroupId}`}/plugins/test2code/dispatch-action`;
  axios.post(requestURL, {
    type: 'CANCEL',
    payload: { sessionId },
  });
}

export const InProgress = inProgress(({ className }: Props) => {
  const { push } = useHistory();
  const activeTab = window.location.host;
  const config = useAgentConfig() || {};

  return (
    <div className={className}>
      <Header>
        <OverflowText>{config.testName}</OverflowText>
      </Header>
      <Content>
        <Panel>
          <Icons.Stopwatch height={32} width={28} />
          <TimerWrapper>
            <Timer />
          </TimerWrapper>
        </Panel>
        <Instructions>Recording and analyzing your code coverage...</Instructions>
        <Panel align="space-between">
          <FinishButton
            type="secondary"
            onClick={() => {
              finishRecordingSession(activeTab, config);
              push('/manual-testing/finish-recording');
            }}
          >
            <FinishButtonIcon height={16} width={16} />
            Finish testing
          </FinishButton>
          <CancelButton
            onClick={() => {
              cancelRecordingSession(activeTab, config);
              push('/manual-testing');
            }}
            type="secondary"
            size="large"
          >
            Cancel test
          </CancelButton>
        </Panel>
      </Content>
    </div>
  );
});

const Header = inProgress.header('div');
const Content = inProgress.content('div');
const TimerWrapper = inProgress.timerWrapper('div');
const Instructions = inProgress.instructions('div');
const FinishButton = inProgress.finishButton(Button);
const FinishButtonIcon = inProgress.finishButtonIcon(Icons.Check);
const CancelButton = inProgress.cancelButton(Button);
