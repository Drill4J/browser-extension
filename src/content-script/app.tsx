import * as React from 'react';
import { Icons } from '@drill4j/ui-kit';
import { MemoryRouter } from 'react-router-dom';
import { BEM } from '@redneckz/react-bem-helper';

import { browser } from 'webextension-polyfill-ts';
import { Logo } from './logo';
import { AgentContext, withAgentContext } from './context';
import { useBackendConnectionStatus } from '../hooks';
import {
  reducer, setIsWidgetVisible, setCorner, setInitial,
} from './reducer';
import { useDispatcher } from './hooks';
import { AgentStatus, BackendConnectionStatus } from '../common/enums';
import { ExtensionPositionIcon } from './extension-position-icon';
import { HideWidgetIcon } from './hide-widget-icon';
import { Pages } from './pages';

import '../bootstrap-imports.scss';
import styles from './app.module.scss';

const app = BEM(styles);

interface Props {
  host: string;
}

export const App = withAgentContext(app(({ host }: Props) => {
  const {
    data: backendConnectionStatus,
  } = useBackendConnectionStatus();

  const agent = React.useContext(AgentContext);

  const [state, dispatch] = React.useReducer(reducer(async (newState: any) => {
    await browser.storage.local.set({ [host]: newState });
  }), { });

  useDispatcher(state, dispatch);

  React.useEffect(() => {
    (async function loadConfig() {
      const { [host]: data } = await browser.storage.local.get(host);
      dispatch(setInitial(data));
    }());
  }, []);

  const isConnectionLost = backendConnectionStatus === BackendConnectionStatus.RECONNECTING;
  const isAgentOffline = backendConnectionStatus === BackendConnectionStatus.AVAILABLE
    && agent && agent.status === AgentStatus.OFFLINE;
  const isAgentBusy = backendConnectionStatus === BackendConnectionStatus.AVAILABLE
    && agent && agent.status === AgentStatus.BUSY;
  const isAgentNotRegistered = backendConnectionStatus === BackendConnectionStatus.AVAILABLE
    && agent && agent.status === AgentStatus.NOT_REGISTERED;

  return (
    <MemoryRouter>
      <div className="d-flex justify-content-between align-items-center w-100 px-4 monochrome-black fs-14">
        <Logo viewBox="0 0 24 24" width={24} height={24} />
        { isConnectionLost && (
          <div className="d-flex align-items-center gx-1">
            <div className="mr-1 monochrome-default"><Icons.Cancel /></div>
            <span className="bold">Connection lost.</span>
            <span>Please wait. We’re trying to reconnect.</span>
          </div>
        )}
        {(isAgentOffline || isAgentBusy) && (
          <div className="d-flex align-items-center gx-1">
            <div className="mr-1 monochrome-default"><Icons.Cancel /></div>
            <span className="bold">
              Agent is
              {' '}
              {agent.status === AgentStatus.OFFLINE ? 'offline' : 'busy'}
              .
            </span>
            <span>In order to perform testing agent has to be online.</span>
          </div>
        )}
        {isAgentNotRegistered && (
          <div className="d-flex align-items-center gx-1">
            <div className="mr-1 monochrome-default"><Icons.Cancel /></div>
            <span className="bold">Agent is not registered.</span>
            <span>Please complete registration in the Admin Panel</span>
          </div>
        )}
        {!isConnectionLost && !isAgentOffline && !isAgentBusy && !isAgentNotRegistered && <Pages />}
        <Actions className="d-flex align-items-center gx-4">
          <div title={`Fix to the ${state.corner === 'bottom' ? 'top' : 'bottom'}`}>
            <ExtensionPositionIcon
              onClick={() => dispatch(setCorner(state.corner))}
              viewBox="0 0 16 15"
              rotate={state.corner === 'bottom' ? 0 : 180}
              height={15}
              width={24}
            />
          </div>
          <div title="Hide to the Extensions panel">
            <HideWidgetIcon
              onClick={() => dispatch(setIsWidgetVisible(false))}
              viewBox="0 0 16 15"
              height={15}
              width={24}
            />
          </div>
        </Actions>
      </div>
    </MemoryRouter>
  );
}));

const Actions = app.actions('div');
