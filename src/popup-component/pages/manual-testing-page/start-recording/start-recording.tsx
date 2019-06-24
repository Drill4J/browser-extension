import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';
import nanoid from 'nanoid';

import { Icons, Input, Button } from '../../../../components';
import { Panel } from '../../../../layouts';
import { useAgentConfig, useActiveTab } from '../../../../hooks';
import { AgentConfig } from '../../../../types/agent-config';

import styles from './start-recording.module.scss';

const startRecording = BEM(styles);

function startRecordingSession(activeTab: string, testName: string, config: AgentConfig) {
  const sessionId = nanoid();
  browser.storage.local.set({ [activeTab]: { ...config, testName, isActive: true, sessionId } });
  axios.post(`/agents/${config.agentId}/coverage/dispatch-action`, {
    type: 'START',
    payload: { sessionId },
  });
}

export const StartRecording = withRouter(
  startRecording(({ className, history: { push } }) => {
    const [testName, setTestName] = React.useState('');
    const activeTab = useActiveTab();
    const config = useAgentConfig() || {};

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
            onChange={({ currentTarget: { value } }: React.SyntheticEvent<HTMLInputElement>) =>
              setTestName(value)
            }
          />
          <StartButton
            type="primary"
            disabled={!Boolean(testName)}
            onClick={() => {
              startRecordingSession(activeTab, testName, config);
              push('/manual-testing/in-progress');
            }}
          >
            <Panel align="center">
              <StartButtonIcon />
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
const StartButtonIcon = startRecording.startButtonIcon(Icons.Start);
