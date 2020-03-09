import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { useHistory } from 'react-router-dom';
import { Button, OverflowText, Panel } from '@drill4j/ui-kit';

import { useAgentConfig } from '../../../../hooks';
import { TestResult } from './test-result';

import styles from './finish-recording.module.scss';

interface Props {
  className?: string;
}

const finishRecording = BEM(styles);

export const FinishRecording = finishRecording(({ className }: Props) => {
  const { push } = useHistory();
  const { testName = '', timerStart = 0 } = useAgentConfig() || {};

  const seconds = (`0${Math.floor((Date.now() - timerStart) / 1000) % 60}`).slice(-2);
  const minutes = (`0${Math.floor((Date.now() - timerStart) / 60000) % 60}`).slice(-2);
  const hours = (`0${Math.floor((Date.now() - timerStart) / 3600000)}`).slice(-2);

  return (
    <div className={className}>
      <Header>
        <OverflowText>{testName}</OverflowText>
      </Header>
      <Content>
        <Title>Testing finished</Title>
        <TestResultsPanel>
          <TestResult label="Test time" value={`${hours}:${minutes}:${seconds}`} />
          <TestResult label="Code coverage" value={0} />
          <TestResult label="Risks methods covered" value={0} />
          <TestResult label="Total methods covered" value={0} />
        </TestResultsPanel>
        <Panel>
          <Button type="secondary" size="large" onClick={() => push('/manual-testing')}>
            New manual test
          </Button>
        </Panel>
      </Content>
    </div>
  );
});

const Header = finishRecording.header('div');
const Content = finishRecording.content('div');
const Title = finishRecording.title('div');
const TestResultsPanel = finishRecording.testResults('div');
