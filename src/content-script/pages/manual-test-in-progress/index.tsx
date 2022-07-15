import * as React from 'react';
import { Button, EllipsisOverflowText } from '@drill4j/ui-kit';
import { BEM } from '@redneckz/react-bem-helper';

import { SessionContext, ActiveScopeContext, AgentContext } from '../../context';
import { percentFormatter } from '../../../utils';
import { Timer } from './timer';
import { ConfirmAbortSession } from './confirm-abort-test';
import { ConfirmFinishTest } from './confirm-finish-test';

import styles from './manual-test-in-progress.module.scss';

const manualTestInProgress = BEM(styles);

export const ManualTestInProgress = () => {
  const session = React.useContext(SessionContext);
  const scope = React.useContext(ActiveScopeContext);
  const [isConfirmingAbort, setIsConfirmingAbort] = React.useState(false);
  const [isConfirmingFinishTest, setIsConfirmingFinishTest] = React.useState(false);
  const agent = React.useContext(AgentContext);

  if (isConfirmingAbort) {
    return (
      <div className="d-flex align-items-center gx-6 position-relative">
        <ConfirmAbortSession setIsConfirmingAbort={setIsConfirmingAbort} />
      </div>
    );
  }

  if (isConfirmingFinishTest) {
    return (
      <div className="d-flex align-items-center gx-6 position-relative">
        <ConfirmFinishTest setIsConfirmingFinishTest={setIsConfirmingFinishTest} />
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gx-6 position-relative">
      <div className="d-flex align-items-center gx-2">
        <ActiveSessionIndicator />
        <div className="d-flex align-items-center">
          <span className="mr-1">Test:</span>
          <TestName className="bold" title={session?.testName}>
            {session?.testName}
          </TestName>
        </div>
      </div>
      <div className="d-flex gx-1">
        <span>Duration:</span>
        <span className="bold">
          <Timer start={session?.start} />
        </span>
      </div>
      <div className="d-flex gx-1">
        <span>Scope Coverage:</span>
        {(agent.mustRecordJsCoverage || agent.adapterType === 'groups') && (
          <span
            className="bold"
            title={
              agent.adapterType === 'groups'
                ? 'Scope coverage for each Agent from Service Group is available in the Admin Panel'
                : 'Scope coverage for JS agent is displayed after the test is finished'
            }
          >
            n/a
          </span>
        )}
        {!agent.mustRecordJsCoverage && agent.adapterType === 'agents' && (
          <span className="bold">{percentFormatter(scope?.coverage?.percentage || 0)}%</span>
        )}
      </div>
      <div className="d-flex gx-4">
        <Button size="small" type="primary" onClick={() => setIsConfirmingFinishTest(true)}>
          Finish
        </Button>
        <Button size="small" type="secondary" onClick={() => setIsConfirmingAbort(true)}>
          Abort
        </Button>
      </div>
    </div>
  );
};

const TestName = manualTestInProgress.testName(EllipsisOverflowText);
const ActiveSessionIndicator = manualTestInProgress.activeSessionIndicator('span');
