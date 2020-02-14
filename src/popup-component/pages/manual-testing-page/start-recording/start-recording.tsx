import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Icons, Input, Button } from '../../../../components';
import { Panel } from '../../../../layouts';
import { useAgentConfig, useActiveTab } from '../../../../hooks';
import { startAgentSession, startGroupSession } from '../api';

import styles from './start-recording.module.scss';

interface Props extends RouteComponentProps {
  className?: string;
}

const startRecording = BEM(styles);

export const StartRecording = withRouter(
  startRecording(({ className, history: { push } }: Props) => {
    const [testName, setTestName] = React.useState('');
    const activeTab = useActiveTab();
    const config = useAgentConfig() || {};
    const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
      setTestName(value);
    };

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
            onChange={handleOnChange}
          />
          <StartButton
            type="primary"
            disabled={!testName}
            onClick={async () => {
              config.agentId ? await startAgentSession(activeTab, testName, config) : await startGroupSession(activeTab, testName, config);
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
