import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';

import { Icons, Button, OverflowText } from '../../../../components';
import { useAgentConfig, useActiveTab } from '../../../../hooks';
import { AgentConfig } from '../../../../types/agent-config';
import { Timer } from './timer';

import styles from './in-progress.module.scss';

const inProgress = BEM(styles);

function finishRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false, timerStart: 0 } });
  axios.post(`/agents/${config.agentId}/coverage/dispatch-action`, {
    type: 'STOP',
    payload: { sessionId: config.sessionId },
  });
}

function cancelRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false, timerStart: 0 } });
  axios.post(`/agents/${config.agentId}/coverage/dispatch-action`, {
    type: 'CANCEL',
    payload: { sessionId: config.sessionId },
  });
}

export const InProgress = withRouter(
  inProgress(({ className, history: { push } }) => {
    const activeTab = useActiveTab();
    const config = useAgentConfig() || {};
    return (
      <div className={className}>
        <Header>
          <OverflowText>{config.testName}</OverflowText>
        </Header>
        <Content>
          <Icons.Stopwatch />
          <TimerWrapper>
            <Timer />
          </TimerWrapper>
          <Instructions>Recording and analyzing your code coverage ...</Instructions>
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
              push('/manual-testing/start-recording');
            }}
          >
            Cancel
          </CancelButton>
        </Content>
      </div>
    );
  }),
);

const Header = inProgress.header('div');
const Content = inProgress.content('div');
const TimerWrapper = inProgress.timerWrapper('div');
const Instructions = inProgress.instructions('div');
const FinishButton = inProgress.finishButton(Button);
const FinishButtonIcon = inProgress.finishButtonIcon(Icons.Checkbox);
const CancelButton = inProgress.cancelButton('div');
