import * as React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';

import { StartRecording } from './start-recording';
import { InProgress } from './in-progress';
import { FinishRecording } from './finish-recording';

export const ManualTestingPage = ({ match }: RouteComponentProps) => (
  <Switch>
    <Route path="/" component={StartRecording} />
    <Route path="/in-progress" component={InProgress} />
    <Route path="/finish-recording" component={FinishRecording} />
  </Switch>
);
