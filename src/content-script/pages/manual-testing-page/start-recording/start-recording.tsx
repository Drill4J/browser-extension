import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { useHistory } from 'react-router-dom';
import { Inputs, Button } from '@drill4j/ui-kit';

import { useAgentConfig, useJsAgentInGroup } from '../../../../hooks';
import { startGroupSession, startSession } from '../api';

import styles from './start-recording.module.scss';

interface Props {
  className?: string;
}

const startRecording = BEM(styles);

export const StartRecording = startRecording(({ className }: Props) => {
  const { push } = useHistory();
  const [testName, setTestName] = React.useState('');
  const activeTab = window.location.host;
  const config = useAgentConfig() || {};
  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setTestName(value);
  };
  const jsAgentInGroup = useJsAgentInGroup();

  return (
    <div className={className}>
      <Header>
        New manual test
      </Header>
      <Content>
        <Message>
          Enter the name of a manual test and click the Start button. The System will begin to
          collect coverage.
        </Message>
        <TestName>Test name</TestName>
        <form onSubmit={(event) => event.preventDefault()}>
          <Inputs.Text
            placeholder="Give this test a name"
            value={testName}
            onChange={handleOnChange as any}
          />
          <StartButton
            type="primary"
            size="large"
            disabled={!testName}
            onClick={async () => {
              config.drillAgentId
                ? await startSession(activeTab, testName, config)
                : await startGroupSession(activeTab, testName, config, jsAgentInGroup);
              push('/manual-testing/in-progress');
            }}
          >
            Start a new test
          </StartButton>
        </form>

      </Content>
    </div>
  );
});

const Header = startRecording.header('div');
const Content = startRecording.content('div');
const Message = startRecording.message('div');
const TestName = startRecording.testName('div');
const StartButton = startRecording.startButton(Button);
