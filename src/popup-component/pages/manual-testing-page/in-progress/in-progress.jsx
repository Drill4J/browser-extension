import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';
import browser from 'webextension-polyfill';
import axios from 'axios';

import { Icons, Button } from '../../../../components';
import { useLocalStorage } from '../../../../hooks';

import styles from './in-progress.module.scss';

const inProgress = BEM(styles);

function finishRecordingSession() {
  browser.storage.local.set({ isActive: false });
  axios.patch('/agents/MySuperAgent/action-plugin', {
    sessionId: browser.runtime.id,
    isRecord: false,
  });
}

export const InProgress = withRouter(
  inProgress(({ className, history: { push } }) => {
    const { testName } = useLocalStorage('testName') || {};
    return (
      <div className={className}>
        <Header>{testName}</Header>
        <Content>
          <Icons.Stopwatch />
          <Instructions>Recording and analyzing your code coverage ...</Instructions>
          <FinishButton
            type="secondary"
            onClick={() => {
              finishRecordingSession();
              push('/manual-testing/finish-recording');
            }}
          >
            Finish testing
          </FinishButton>
          <CancelButton>Cancel</CancelButton>
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
