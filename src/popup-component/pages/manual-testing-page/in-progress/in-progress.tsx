import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';

import { Icons, Button } from '../../../../components';
import { useLocalStorage } from '../../../../hooks';

import styles from './in-progress.module.scss';

const inProgress = BEM(styles);

function finishRecordingSession(agentId: string, sessionId: string) {
  browser.storage.local.set({ isActive: false });
  axios.post(`/agents/${agentId}/dispatch-action`, {
    type: 'STOP',
    payload: { sessionId },
  });
}

function cancelRecordingSession(agentId: string, sessionId: string) {
  browser.storage.local.set({ isActive: false });
  axios.post(`/agents/${agentId}/dispatch-action`, {
    type: 'CANCEL',
    payload: { sessionId },
  });
}

export const InProgress = withRouter(
  inProgress(({ className, history: { push } }) => {
    const { testName = '', agentId = '', sessionId = '' } =
      useLocalStorage(['testName', 'agentId', 'sessionId']) || {};
    return (
      <div className={className}>
        <Header>{testName}</Header>
        <Content>
          <Icons.Stopwatch />
          <Instructions>Recording and analyzing your code coverage ...</Instructions>
          <FinishButton
            type="secondary"
            onClick={() => {
              finishRecordingSession(agentId, sessionId);
              push('/manual-testing/finish-recording');
            }}
          >
            Finish testing
          </FinishButton>
          <CancelButton
            onClick={() => {
              cancelRecordingSession(agentId, sessionId);
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
