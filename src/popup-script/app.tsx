import * as React from 'react';

import { BackendConnectionStatus } from 'common/enums';
import { MainPage, ConnectionPage } from './pages';
import { useBackendConnectionStatus } from '../hooks';

import '../bootstrap-imports.scss';

export const App = () => {
  const backendConnectionData = useBackendConnectionStatus<BackendConnectionStatus>();

  return (
    <div className="popup-container">
      {backendConnectionData?.data === 'available'
        ? <MainPage />
        : <ConnectionPage />}
    </div>
  );
};
