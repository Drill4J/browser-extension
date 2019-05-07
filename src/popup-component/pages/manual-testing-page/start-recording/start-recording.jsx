import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';
import browser from 'webextension-polyfill';
import axios from 'axios';

import { Icons, Input, Button } from '../../../../components';
import { Panel } from '../../../../layouts';
import { useLocalStorage } from '../../../../hooks';

import styles from './start-recording.module.scss';

const startRecording = BEM(styles);

function startRecordingSession(testName, agentId) {
  browser.storage.local.set({ testName, isActive: true });
  axios.patch(`/agents/${agentId}/action-plugin`, {
    sessionId: browser.runtime.id,
    isRecord: true,
  });
}

export const StartRecording = withRouter(
  startRecording(({ className, history: { push } }) => {
    const [testName, setTestName] = React.useState('');
    const { agentId } = useLocalStorage('agentId') || {};

    return (
      <div className={className}>
        <Header>
          <BackIcon>
            <Icons.Arrow onClick={() => push('/')} />
          </BackIcon>
          Manual testing
        </Header>
        <Content>
          <Message>
            Something about what’s going to happen, what test will be run and where to see results.
          </Message>
          <TestName>Test name</TestName>
          <Input
            placeholder="Give this test a name"
            value={testName}
            onChange={({ target: { value } }) => setTestName(value)}
          />
          <StartButton
            type="primary"
            disabled={!testName}
            onClick={() => {
              startRecordingSession(testName, agentId);
              push('/manual-testing/in-progress');
            }}
          >
            <Panel align="center">
              <Icons.Start />
              Start a new test
            </Panel>
          </StartButton>
        </Content>
      </div>
    );
  }),
);

const Header = startRecording.header('div');
const BackIcon = startRecording.backIcon('div');
const Content = startRecording.content('div');
const Message = startRecording.message('div');
const TestName = startRecording.testName('div');
const StartButton = startRecording.startButton(Button);
