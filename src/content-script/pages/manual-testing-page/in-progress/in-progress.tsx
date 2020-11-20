import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import {
  Icons, Panel, Button, OverflowText,
} from '@drill4j/ui-kit';
import * as bgInterop from '../../../../common/background-interop';

import { percentFormatter } from '../../../../utils';
import { Timer } from './timer';
import { TestResult } from '../test-result';

import styles from './in-progress.module.scss';
import { SessionContext } from '../../../context/session-context';
import { ActiveScopeContext } from '../../../context/active-scope-context';

interface Props {
  className?: string;
}

const inProgress = BEM(styles);

export const InProgress = inProgress(({ className }: Props) => {
  const session = React.useContext(SessionContext);
  const scope = React.useContext(ActiveScopeContext);
  console.log('InProgress SessionContext', session);
  const [isRequestInProgress, updateRequestStatus] = React.useState(false);

  return (
    <div className={className}>
      <Header>
        <OverflowText>{session?.testName}</OverflowText>
      </Header>
      <Content>
        {!isRequestInProgress && (
          <TestTimer>
            <Icons.Stopwatch width={22} height={24} />
            <Timer start={session?.start} />
          </TestTimer>
        )}
        {/* {config.drillGroupId ? (
          <WarningMessage>
            Realtime coverage collection is unavailable for service groups.
          </WarningMessage>
        )
          : (

          )} */}
        <>
          <ResultsLabel>Active scope statistics</ResultsLabel>
          <TestResultsPanel>
            <TestResult label="Scope coverage" value={`${percentFormatter(scope?.coverage?.percentage || 0)}%`} color="blue" />
            <TestResult label="Risks methods covered" value={scope?.coverage?.riskCount?.covered} color="red" />
            <TestResult label="Total methods covered" value={scope?.coverage?.methodCount?.covered} color="blue" />
          </TestResultsPanel>
        </>
        {!isRequestInProgress && (
          <Panel align="space-between">
            <FinishButton
              type="secondary"
              onClick={async () => {
                updateRequestStatus(true);
                try {
                  await bgInterop.stopTest();
                } catch (e) {
                  console.log('finish recording session failed', e);
                }
                updateRequestStatus(false);
              }}
            >
              <FinishButtonIcon height={16} width={16} />
              Finish testing
            </FinishButton>
            <CancelButton
              onClick={async () => {
                updateRequestStatus(true);
                try {
                  await bgInterop.cancelTest();
                } catch (e) {
                  debugger;
                  console.log('cancel recording session failed', e);
                }
                updateRequestStatus(false);
              }}
              type="secondary"
              size="large"
            >
              Cancel test
            </CancelButton>
          </Panel>
        )}
        {isRequestInProgress && (
          <PendingRequestMessage>
            <Spinner />
            <div>Sending data...</div>
          </PendingRequestMessage>
        )}
      </Content>
    </div>
  );
});

const PendingRequestMessage = inProgress.pendingRequestMessage('div');
const Spinner = inProgress.spinner('div');
const Header = inProgress.header('div');
const Content = inProgress.content('div');
const TestTimer = inProgress.testTimer(Panel);
const WarningMessage = inProgress.warningMessage('span');
const ResultsLabel = inProgress.resultsLabel('div');
const TestResultsPanel = inProgress.testResultsPanel('div');
const FinishButton = inProgress.finishButton(Button);
const FinishButtonIcon = inProgress.finishButtonIcon(Icons.Check);
const CancelButton = inProgress.cancelButton(Button);
