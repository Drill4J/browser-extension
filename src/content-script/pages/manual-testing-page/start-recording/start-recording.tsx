import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Inputs, Button } from '@drill4j/ui-kit';
import * as bgInterop from '../../../../common/background-interop';
import styles from './start-recording.module.scss';
import { AgentContext } from '../../../context/agent-context';

interface Props {
  className?: string;
}

const startRecording = BEM(styles);

export const StartRecording = startRecording(({ className }: Props) => {
  const [testName, setTestName] = React.useState('');
  const [isStartPressed, setStartPressed] = React.useState(false);
  const agent = React.useContext(AgentContext);

  return (
    <div className={className}>
      <Header>
        New manual test
      </Header>
      <Content>
        { (window as any).reloadRequired
          ? (
            <>
              <Message> JS coverage recording requires page reload between each test </Message>
              <Button
                onClick={() => window.location.reload()}
                type="primary"
                size="large"
              >
                Reload page
              </Button>
            </>
          )
          : (
            <>
              <form onSubmit={(event) => event.preventDefault()}>
                <Message>
                  Enter the name of a manual test and click the Start button. The System will begin to
                  collect coverage.
                </Message>
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
                  disabled={!testName || isStartPressed}
                  onClick={async () => {
                    try {
                      setStartPressed(true);
                      const data = await bgInterop.startTest(testName);
                      console.log('start pressed', agent);
                      if (agent.mustRecordJsCoverage) {
                        (window as any).reloadRequired = true;
                      }
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
            </>
          )}
      </Content>
    </div>
  );
});

const Header = startRecording.header('div');
const Content = startRecording.content('div');
const Message = startRecording.message('div');
const TestName = startRecording.testName('div');
const StartButton = startRecording.startButton(Button);
