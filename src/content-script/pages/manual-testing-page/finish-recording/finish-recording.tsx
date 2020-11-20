import * as React from 'react';
import { useState } from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Button, OverflowText, Panel } from '@drill4j/ui-kit';

// import { percentFormatter } from '../../../../utils';
import { TestResult } from '../test-result';
import * as bgInterop from '../../../../common/background-interop';
import styles from './finish-recording.module.scss';
import { SessionContext } from '../../../context/session-context';
import { ActiveScopeContext } from '../../../context/active-scope-context';
import { percentFormatter } from '../../../../utils';

interface Props {
  className?: string;
}

const finishRecording = BEM(styles);

export const FinishRecording = finishRecording(({ className }: Props) => {
  const [isRequestInProgress, updateRequestStatus] = React.useState(false);
  const scope = React.useContext(ActiveScopeContext);
  const session = React.useContext(SessionContext);

  const [time, setTime] = useState<string>('unset');
  React.useEffect(() => {
    if (!session || !session.end) return;
    const duration = session.end - session.start;
    const seconds = (`0${Math.floor((duration) / 1000) % 60}`).slice(-2);
    const minutes = (`0${Math.floor((duration) / 60000) % 60}`).slice(-2);
    const hours = (`0${Math.floor((duration) / 3600000)}`).slice(-2);
    setTime(`${hours}:${minutes}:${seconds}`);
  }, [session]);

  return (
    <div className={className}>
      { session && (
        <>
          <Header>
            <OverflowText>{session.testName}</OverflowText>
          </Header>
          <Content>
            <Title>Testing finished</Title>
            <TestResultsPanel>
              <TestResult label="Test time" value={time} />
              <TestResult label="Code coverage" value={`${percentFormatter(scope?.coverage?.percentage || 0)}%`} color="blue" />
              <TestResult label="Risks methods covered" value={scope?.coverage?.riskCount?.covered} color="red" />
              <TestResult label="Total methods covered" value={scope?.coverage?.methodCount?.covered} color="blue" />
            </TestResultsPanel>
            <Panel>
              <Button
                type="secondary"
                size="large"
                onClick={async () => {
                  updateRequestStatus(true);
                  try {
                    await bgInterop.cleanupTestSession();
                  } catch (e) {
                    debugger;
                    console.log('cancel recording session failed', e);
                  }
                  updateRequestStatus(false);
                }}
              >
                New manual test
              </Button>
            </Panel>
          </Content>
        </>
      ) }
    </div>
  );
});

const Header = finishRecording.header('div');
const Content = finishRecording.content('div');
const Title = finishRecording.title('div');
const TestResultsPanel = finishRecording.testResults('div');
