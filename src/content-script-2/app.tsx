import * as React from 'react';
import { Icons } from '@drill4j/ui-kit';
import { MemoryRouter } from 'react-router-dom';
import { BEM } from '@redneckz/react-bem-helper';

import { browser } from 'webextension-polyfill-ts';
import { AgentContext, withAgentContext } from './context';
import { useBackendConnectionStatus } from '../hooks/use-backend-connection-status';
import {
  reducer, setIsWidgetVisible, setCorner, setInitial,
} from './reducer';
import { useDispatcher } from './hooks';
import { AgentStatus, BackendConnectionStatus } from '../common/enums';
import { ExtensionPositionIcon } from './extension-position-icon';
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
    && agent && agent.status !== AgentStatus.ONLINE;

  return (
    <MemoryRouter>
      <BorderTop />
      <div className="d-flex justify-content-between w-100 px-4 monochrome-black fs-14">
        <Logo>Logo</Logo>
        { isConnectionLost && (
          <div className="d-flex align-items-center gx-1">
            <div className="mr-1 monochrome-default"><Icons.Cancel /></div>
            <span className="bold">Connection lost.</span>
            <span>Please wait. We’re trying to reconnect.</span>
          </div>
        )}
        { isAgentOffline && (
          <div className="d-flex align-items-center gx-1">
            <div className="mr-1 monochrome-default"><Icons.Cancel /></div>
            <div className="bold">Agent appears to be offline or busy.</div>
            <span>To start testing your agent has to be registered and online.</span>
          </div>
        )}
        {!isConnectionLost && !isAgentOffline && <Pages />}
        <Actions className="d-flex align-items-center gx-4">
          <ExtensionPositionIcon
            onClick={() => dispatch(setCorner(state.corner))}
            viewBox="0 0 16 15"
            rotate={!state.corner || state.corner === 'bottom' ? 0 : 180}
            height={15}
            width={24}
          />
          <Icons.Close
            onClick={() => dispatch(setIsWidgetVisible(false))}
            height={10}
            width={10}
          />
        </Actions>
      </div>
    </MemoryRouter>
  );
}));

const Logo = app.logo('div');
const BorderTop = app.borderTop('div');
const Actions = app.actions('div');
