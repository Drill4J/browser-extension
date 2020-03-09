import * as React from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';

import { StartRecording } from './start-recording';
import { InProgress } from './in-progress';
import { FinishRecording } from './finish-recording';

export const ManualTestingPage = () => {
  const { push } = useHistory();
  React.useEffect(() => {
    async function loadConfig() {
      const { [window.location.host]: { isActive = false } = {} } = await browser.storage.local.get(window.location.host);

      isActive ? push('/manual-testing/in-progress') : push('/manual-testing');
    }
    loadConfig();
  }, []);
  return (
    <Switch>
      <Route exact path="/manual-testing" component={StartRecording} />
      <Route exact path="/manual-testing/in-progress" component={InProgress} />
      <Route exact path="/manual-testing/finish-recording" component={FinishRecording} />
    </Switch>
  );
};
