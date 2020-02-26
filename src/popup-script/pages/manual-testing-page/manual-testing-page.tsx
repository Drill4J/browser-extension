import * as React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';

import { StartRecording } from './start-recording';
import { InProgress } from './in-progress';
import { FinishRecording } from './finish-recording';

export const ManualTestingPage = ({ match }: RouteComponentProps) => (
  <Switch>
    <Route path={`${match.path}/start-recording`} component={StartRecording} />
    <Route path={`${match.path}/in-progress`} component={InProgress} />
    <Route path={`${match.path}/finish-recording`} component={FinishRecording} />
  </Switch>
);
