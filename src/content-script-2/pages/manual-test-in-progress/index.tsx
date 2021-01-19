import * as React from 'react';
import {
  Button, EllipsisOverflowText,
} from '@drill4j/ui-kit';
import { BEM } from '@redneckz/react-bem-helper';

import { SessionContext, ActiveScopeContext } from '../../context';
import { percentFormatter } from '../../../utils';
import * as bgInterop from '../../../common/background-interop';
import { Timer } from './timer';
import { ConfirmAbortSession } from './confirm-abort-test';
import { Spinner } from '../../components';

import styles from './manual-test-in-progress.module.scss';

const manualTestInProgress = BEM(styles);

interface Props {
  className?: string;
}

export const ManualTestInProgress = manualTestInProgress(({ className }: Props) => {
  const session = React.useContext(SessionContext);
  const scope = React.useContext(ActiveScopeContext);
  const [isRequestInProgress, updateRequestStatus] = React.useState(false);
  const [isConfirmingAbort, setIsConfirmingAbort] = React.useState(false);

  return (
    <div className={`${className} d-flex align-items-center gx-6 position-relative`}>
      {!isConfirmingAbort ? (
        <>
          <div className="d-flex align-items-center gx-2">
            <ActiveSessionIndicator />
            <span>
              <span className="mr-1">Test:</span>
              <TestName className="bold" title={session?.testName}>{session?.testName}</TestName>
            </span>
          </div>
          <div className="d-flex gx-1">
            <span>Duration:</span>
            <span className="bold"><Timer start={session?.start} /></span>
          </div>
          <div className="d-flex gx-1">
            <span>Scope Coverage:</span>
            {(window as any).reloadRequired ? (
              <span
                className="bold"
                title="For JS agent coverage may be shown only after the test is finished"
              >
                n/a in real-time
              </span>
            ) : (
              <span className="bold">
                {percentFormatter(scope?.coverage?.percentage || 0)}
                %
              </span>
            )}
          </div>
          <div className="d-flex gx-4">
            <Button
              size="small"
              type="primary"
              disabled={isRequestInProgress}
              onClick={async () => {
                updateRequestStatus(true);
                await bgInterop.stopTest();
                updateRequestStatus(false);
              }}
            >
              {isRequestInProgress ? (
                <div className="d-flex align-items-center gx-2">
                  <Spinner />
                  <span>Finishing...</span>
                </div>
              ) : <span>Finish</span>}
            </Button>
            <Button
              size="small"
              type="secondary"
              disabled={isRequestInProgress}
              onClick={() => setIsConfirmingAbort(true)}
            >
              Abort
            </Button>
          </div>
        </>
      ) : <ConfirmAbortSession setIsConfirmingAbort={setIsConfirmingAbort} />}
    </div>
  );
});

const TestName = manualTestInProgress.testName(EllipsisOverflowText);
const ActiveSessionIndicator = manualTestInProgress.activeSessionIndicator('span');
