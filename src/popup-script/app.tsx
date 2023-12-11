import * as React from 'react';

import { ConnectionForm } from '../forms';
import { BackendConnectionStatus } from '../common/enums';
import { MainPage } from './pages';
import { useAgentOnActiveTab, useBackendConnectionStatus } from '../hooks';
import { AgentNotFound } from './pages/main-page/agent-not-found';

import '../bootstrap-imports.scss';

export const App = () => {
  const backendConnectionData = useBackendConnectionStatus();
  const { data: agent, isLoading, isError } = useAgentOnActiveTab();
  const hasAssociatedAgent = !isLoading && !isError && Boolean(agent);

  return (
    <div className="popup-container">
      {backendConnectionData?.data === BackendConnectionStatus.AVAILABLE && hasAssociatedAgent && <MainPage agent={agent} />}
      {backendConnectionData?.data === BackendConnectionStatus.AVAILABLE && !hasAssociatedAgent && <AgentNotFound />}
      {backendConnectionData?.data !== BackendConnectionStatus.AVAILABLE && (
        <div className="d-flex flex-column h-100 p-4">
          <div className="regular monochrome-default fs-14 mb-2">
            Sign in
          </div>
          <ConnectionForm/>
        </div>
      )}
    </div>
  );
};
