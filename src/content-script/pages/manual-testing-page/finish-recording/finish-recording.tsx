import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { useHistory } from 'react-router-dom';
import { Button, OverflowText, Panel } from '@drill4j/ui-kit';

import { useAgentConfig, useActiveScope } from '../../../../hooks';
import { percentFormatter } from '../../../../utils';
import { TestResult } from '../test-result';

import styles from './finish-recording.module.scss';

interface Props {
  className?: string;
}

const finishRecording = BEM(styles);

export const FinishRecording = finishRecording(({ className }: Props) => {
  const { push } = useHistory();
  const { testName = '', timerStart = 0, drillAdminUrl = '' } = useAgentConfig() || {};
  const {
    coverage: {
      ratio = 0,
      riskCount: { covered: risksCovered = 0 } = {},
      methodCount: { covered: methodCount = 0 } = {},
    } = {},
  }: any = useActiveScope(drillAdminUrl) || {};

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
          <TestResult label="Code coverage" value={`${percentFormatter(ratio)}%`} />
          <TestResult label="Risks methods covered" value={risksCovered} />
          <TestResult label="Total methods covered" value={methodCount} />
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
