import * as React from 'react';
import {
  Switch, Route, useHistory,
} from 'react-router-dom';

import { useAgentConfig, useAgentInfo } from '../../../hooks';

import { StartRecording } from './start-recording';
import { InProgress } from './in-progress';
import { FinishRecording } from './finish-recording';
import { UnavailablePage } from '../unavailable-page';

export const ManualTestingPage = () => {
  const { push, location: { pathname } } = useHistory();
  const config = useAgentConfig();
  const { status = '' } = useAgentInfo(config?.drillAdminUrl, config?.drillAgentId) || {};

  React.useEffect(() => {
    if ((status === 'BUSY' || status === 'OFFLINE') && pathname === '/manual-testing') {
      push('/unavailable-page');
    } else if (pathname !== '/unavailable-page' && pathname !== '/test-to-code') {
      config?.isActive ? push('/manual-testing/in-progress') : push('/manual-testing');
    }
  }, [config, status, pathname]);

  return (
    <Switch>
      <Route exact path="/manual-testing" component={StartRecording} />
      <Route exact path="/manual-testing/in-progress" component={InProgress} />
      <Route exact path="/manual-testing/finish-recording" component={FinishRecording} />
      <Route exact path="/unavailable-page" component={UnavailablePage} />
    </Switch>
  );
};
