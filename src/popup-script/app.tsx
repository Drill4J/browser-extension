import * as React from 'react';
import { MemoryRouter, Switch, Route } from 'react-router-dom';

import { MainPage, UnavailablePage } from './pages';

export const App = () => (
  <MemoryRouter>
    <Switch>
      <Route path="/" exact component={MainPage} />
      <Route path="/unavailable-page" component={UnavailablePage} />
    </Switch>
  </MemoryRouter>
);
