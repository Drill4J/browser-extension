import * as React from 'react';
import { MemoryRouter, Switch, Route } from 'react-router-dom';
import browser from 'webextension-polyfill';
import axios from 'axios';

import { LoginPage, MainPage, ManualTestingPage } from './pages';
import { TOKEN_HEADER } from '../common/constants';

export const App = () => {
  React.useEffect(() => {
    axios.post('/login').then((response) => {
      const authToken = response.headers[TOKEN_HEADER.toLowerCase()];
      if (authToken) {
        browser.storage.local.set({ token: authToken });
      }
    });
  }, []);
  return (
    <MemoryRouter>
      <Switch>
        <Route path="/login" exact component={LoginPage} />
        <Route path="/" exact component={MainPage} />
        <Route path="/manual-testing" component={ManualTestingPage} />
      </Switch>
    </MemoryRouter>
  );
};
