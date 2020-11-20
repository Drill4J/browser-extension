import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Inputs, Button } from '@drill4j/ui-kit';
import * as bgInterop from '../../../../common/background-interop';
import styles from './start-recording.module.scss';

interface Props {
  className?: string;
}

const startRecording = BEM(styles);

export const StartRecording = startRecording(({ className }: Props) => {
  const [testName, setTestName] = React.useState('');

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
            onChange={({ currentTarget: { value } }) => {
              setTestName(value);
            }}
          />
          <StartButton
            type="primary"
            size="large"
            disabled={!testName}
            onClick={async () => {
              try {
                const data = await bgInterop.startTest(testName);
                console.log('START_TEST data', data);
              } catch (e) {
                console.log(e);
                debugger;
              }
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
