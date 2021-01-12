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
const Header = startRecording.header('div');
const Content = startRecording.content('div');
const Message = startRecording.message('div');
const ErrorMessage = startRecording.errorMessage('div');
const StartButton = startRecording.startButton(Button);

export const StartRecording = startRecording(({ className }: Props) => {
  const [submitError, setSubmitError] = React.useState('');
  const [testName, setTestName] = React.useState('');
  const [isFormSubmitted, setIsFormSubmitted] = React.useState(false);
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
                style={{ marginTop: '15px' }}
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
                  disabled={!testName || isFormSubmitted}
                  onClick={async () => {
                    setSubmitError('');
                    setIsFormSubmitted(true);
                    try {
                      const data = await bgInterop.startTest(testName);
                      console.log('start pressed', agent);
                      if (agent.mustRecordJsCoverage) {
                        (window as any).reloadRequired = true;
                      }
                      console.log('START_TEST data', data);
                    } catch (e) {
                      console.log(e);
                      const msg = `Failed to start test: ${e?.message || 'an unexpected error occurred'}`;
                      setSubmitError(msg);
                    }
                    setIsFormSubmitted(false);
                  }}
                >
                  Start a new test
                </StartButton>
                { submitError && (
                  <ErrorMessage style={{ marginTop: '15px' }}>
                    {submitError}
                  </ErrorMessage>
                )}
              </form>
            </>
          )}
      </Content>
    </div>
  );
});
