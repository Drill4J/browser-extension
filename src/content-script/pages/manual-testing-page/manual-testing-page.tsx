import * as React from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';

import { useAgentConfig, useAgentInfo } from '../../../hooks';

import { StartRecording } from './start-recording';
import { InProgress } from './in-progress';
import { FinishRecording } from './finish-recording';
import { UnavailablePage } from '../unavailable-page';

export const ManualTestingPage = () => {
  const { push } = useHistory();
  const config = useAgentConfig();
  const { status = '' } = useAgentInfo(config?.drillAdminUrl, config?.drillAgentId) || {};

  React.useEffect(() => {
    if (status === 'BUSY' || status === 'OFFLINE') {
      push('/unavailable-page');
      return;
    }

    config?.isActive ? push('/manual-testing/in-progress') : push('/manual-testing');
  }, [config, status]);

  return (
    <Switch>
      <Route exact path="/manual-testing" component={StartRecording} />
      <Route exact path="/manual-testing/in-progress" component={InProgress} />
      <Route exact path="/manual-testing/finish-recording" component={FinishRecording} />
      <Route exact path="/unavailable-page" component={UnavailablePage} />
    </Switch>
  );
};
