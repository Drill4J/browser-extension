import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';

import { Icons, Button } from '../../../../components';
import { useAgentConfig, useActiveTab } from '../../../../hooks';
import { AgentConfig } from '../../../../types/agent-config';

import styles from './in-progress.module.scss';

const inProgress = BEM(styles);

function finishRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false } });
  axios.post(`/agents/${config.agentId}/dispatch-action`, {
    type: 'STOP',
    payload: { sessionId: config.sessionId },
  });
}

function cancelRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false } });
  axios.post(`/agents/${config.agentId}/dispatch-action`, {
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
        <Header>{(config as any).testName}</Header>
        <Content>
          <Icons.Stopwatch />
          <Instructions>Recording and analyzing your code coverage ...</Instructions>
          <FinishButton
            type="secondary"
            onClick={() => {
              finishRecordingSession(activeTab, config);
              push('/manual-testing/finish-recording');
            }}
          >
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
const Instructions = inProgress.instructions('div');
const FinishButton = inProgress.finishButton(Button);
const CancelButton = inProgress.cancelButton('div');
