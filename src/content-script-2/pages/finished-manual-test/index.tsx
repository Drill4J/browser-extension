import * as React from 'react';
import { Button, Icons, EllipsisOverflowText } from '@drill4j/ui-kit';
import { BEM } from '@redneckz/react-bem-helper';

import { getDuration, percentFormatter } from '../../../utils';
import { ActiveScopeContext, SessionContext } from '../../context';
import * as bgInterop from '../../../common/background-interop';

import styles from './finished-manual-test.module.scss';

const finishedManualTest = BEM(styles);

interface Props {
  className?: string;
}

export const FinishedManualTest = finishedManualTest(({ className }: Props) => {
  const scope = React.useContext(ActiveScopeContext);
  const session = React.useContext(SessionContext);

  const { hours, minutes, seconds } = getDuration(Number(session?.end) - Number(session?.start));

  return (
    <div className={`${className} d-flex align-items-center gx-6`}>
      {session && (
        <>
          <div className="d-flex align-items-center gx-2 green-default">
            <Icons.Success />
            <SuccessMessage>Testing is finished Successfully</SuccessMessage>
          </div>
          <VerticalLine />
          <div>
            <span className="mr-2">Test:</span>
            <TestName className="bold" title={session?.testName}>{session?.testName}</TestName>
          </div>
          <div>
            <span className="mr-2">Duration:</span>
            <span className="bold">{`${hours}:${minutes}:${seconds}`}</span>
          </div>
          <div>
            <span className="mr-1">Scope Coverage:</span>
            <span className="bold">
              {percentFormatter(scope?.coverage?.percentage || 0)}
              %
            </span>
          </div>
          <Button
            size="small"
            type="primary"
            onClick={async () => {
              try {
                await bgInterop.cleanupTestSession();
              } catch (e) {
                console.log('cancel recording session failed', e);
              }
            }}
          >
            Done
          </Button>
        </>
      )}
    </div>
  );
});

const SuccessMessage = finishedManualTest.successMessage('span');
const VerticalLine = finishedManualTest.verticalLine('div');
const TestName = finishedManualTest.testName(EllipsisOverflowText);
