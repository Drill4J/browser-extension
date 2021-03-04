import * as React from 'react';

import { ConnectionForm } from '../forms';
import { BackendConnectionStatus } from '../common/enums';
import { MainPage } from './pages';
import { useBackendConnectionStatus } from '../hooks';

import '../bootstrap-imports.scss';

export const App = () => {
  const backendConnectionData = useBackendConnectionStatus();

  return (
    <div className="popup-container">
      {backendConnectionData?.data === BackendConnectionStatus.AVAILABLE
        ? <MainPage />
        : (
          <div className="d-flex flex-column h-100 justify-content-center px-4 gy-8">
            <div className="regular monochrome-default fs-14 lh-20">
              No connection with backend. Try to refresh the page or connect using your admin address.
            </div>
            <ConnectionForm />
          </div>
        )}
    </div>
  );
};
