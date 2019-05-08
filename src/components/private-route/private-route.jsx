/* eslint-disable react/prop-types */
import * as React from 'react';
import { Route, Redirect } from 'react-router-dom';
import browser from 'webextension-polyfill';

import { useLocalStorage } from '../../hooks';

export function isAuth() {
  const token = browser.storage.local.get('token').then(({ token }) => token);
  return Boolean(token);
}

export function PrivateRoute(props) {
  const { component, ...rest } = props;
  const Component = component;

  const { token } = useLocalStorage('token') || {};

  return (
    <Route
      render={() => (token ? <Component {...props} /> : <Redirect to={{ pathname: '/login' }} />)}
      {...rest}
    />
  );
}
