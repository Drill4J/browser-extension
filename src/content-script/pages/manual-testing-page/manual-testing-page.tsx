import * as React from 'react';
import {
  Switch, Route, useHistory,
} from 'react-router-dom';

import { StartRecording } from './start-recording';
import { InProgress } from './in-progress';
import { FinishRecording } from './finish-recording';
import { UnavailablePage } from '../unavailable-page';
import { AgentContext } from '../../context/agent-context';
import { withSessionContext, SessionContext } from '../../context/session-context';
import { withActiveScopeContext } from '../../context/active-scope-context';
import { SessionStatus } from '../../../background/enums';

export const ManualTestingPage = withActiveScopeContext(withSessionContext(((props: any) => {
  const { push } = useHistory();
  const session = React.useContext(SessionContext);
  console.log('ManualTestingPage SessionContext', session);
  // TODO try react-router-dom redirect?
  React.useEffect(() => {
    switch (session?.status) {
      case SessionStatus.ACTIVE:
        push('/manual-testing/in-progress');
        break;
      case SessionStatus.STOPPED:
        push('/manual-testing/finish-recording');
        break;
      case SessionStatus.CANCELED:
      default:
        push('/manual-testing');
        break;
    }
  }, [push, session?.status]);

  return (
    <AgentContext.Consumer>
      { agent => (
        <>
          {(agent && agent.status === 'ONLINE')
            ? (
              <Switch>
                <Route exact path="/manual-testing" component={StartRecording} />
                <Route exact path="/manual-testing/in-progress" component={InProgress} />
                <Route exact path="/manual-testing/finish-recording" component={FinishRecording} />
              </Switch>
            )
            : <UnavailablePage />}
        </>
      )}
    </AgentContext.Consumer>
  );
})));
