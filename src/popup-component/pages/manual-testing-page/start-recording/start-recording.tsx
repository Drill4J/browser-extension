import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';
import nanoid from 'nanoid';

import { Icons, Input, Button } from '../../../../components';
import { Panel } from '../../../../layouts';
import { useLocalStorage } from '../../../../hooks';

import styles from './start-recording.module.scss';

const startRecording = BEM(styles);

function startRecordingSession(testName: string, agentId: string) {
  const sessionId = nanoid();
  browser.storage.local.set({ testName, isActive: true, sessionId });
  axios.post(`/agents/${agentId}/dispatch-action`, {
    type: 'START',
    payload: { sessionId },
  });
}

export const StartRecording = withRouter(
  startRecording(({ className, history: { push } }) => {
    const [testName, setTestName] = React.useState('');
    const { agentId = '' } = useLocalStorage('agentId') || {};

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
            Enter the name of a manual test and click the Start button. The System will begin to
            collect coverage.
          </Message>
          <TestName>Test name</TestName>
          <Input
            placeholder="Give this test a name"
            value={testName}
            onChange={({ target: { value } }: any) => setTestName(value)}
          />
          <StartButton
            type="primary"
            disabled={!Boolean(testName)}
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
