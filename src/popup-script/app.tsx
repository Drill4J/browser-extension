import * as React from 'react';
import { MemoryRouter, Switch, Route } from 'react-router-dom';

import {
  LoginPage, MainPage, ManualTestingPage, UnavailablePage,
} from './pages';

export const App = () => (
  <MemoryRouter>
    <Switch>
      <Route path="/login" exact component={LoginPage} />
      <Route path="/" exact component={MainPage} />
      <Route path="/manual-testing" component={ManualTestingPage} />
      <Route path="/unavailable-page" component={UnavailablePage} />
    </Switch>
  </MemoryRouter>
);
