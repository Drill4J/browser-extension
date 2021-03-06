import * as React from 'react';
import { useHistory, Switch, Route } from 'react-router-dom';
import { Button } from '@drill4j/ui-kit';

import { SessionStatus } from '../../common/enums';
import { SessionContext, withSessionContext, withActiveScopeContext } from '../context';
import { StartNewManualTest } from './start-new-manual-test';
import { ManualTestInProgress } from './manual-test-in-progress';
import { FinishedManualTest } from './finished-manual-test';
import { ManualTestError } from './manual-test-error';
import * as bgInterop from '../../common/background-interop';
import { SessionErrorType } from '../../background/types';

export const Pages = withActiveScopeContext(withSessionContext(() => {
  const { push } = useHistory();
  const session = React.useContext(SessionContext);

  React.useEffect(() => {
    switch (session?.status) {
      case SessionStatus.ACTIVE:
        push('/manual-test-in-progress');
        break;
      case SessionStatus.STOPPED:
        push('/finished-manual-test');
        break;
      case SessionStatus.ERROR:
        push('/manual-testing-error');
        break;
      default:
        push('/start-new-manual-test');
        break;
    }
  }, [push, session?.status]);

  return (
    <Switch>
      <Route exact path="/manual-test-in-progress" component={ManualTestInProgress} />
      <Route exact path="/finished-manual-test" component={FinishedManualTest} />
      <Route
        exact
        path="/manual-testing-error"
        render={() => (
          <ManualTestError
            message={getSessionErrorMessage(session?.errorType)}
            messageToCopy={session?.error?.message || 'Something happened on the backend'}
          >
            <Button
              type="primary"
              size="small"
              onClick={() => bgInterop.reactivateTestSession()}
            >
              Go Back
            </Button>
            <Button
              type="secondary"
              size="small"
              onClick={() => bgInterop.cleanupTestSession()}
            >
              Discard Test
            </Button>
          </ManualTestError>
        )}
      />
      <Route exact path="/start-new-manual-test" component={StartNewManualTest} />
    </Switch>
  );
}));

function getSessionErrorMessage(errorType: SessionErrorType) {
  switch (errorType) {
    case 'abort':
      return 'Failed to abort test.';
    case 'finish':
      return 'Failed to finish test.';
    default:
      return 'Action failed.';
  }
}
