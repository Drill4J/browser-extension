import * as React from 'react';
import { Panel, Icons } from '@drill4j/ui-kit';
import { browser } from 'webextension-polyfill-ts';
import { MemoryRouter, Switch, Route } from 'react-router-dom';

import { Layout } from './layouts';
import { useDispatcher } from './hooks';
import { reducer, savePosition, setExpanded } from './reducer';
import { Sidebar } from './sidebar';
import { ManualTestingPage } from './pages';


export const App = () => {
  const [state, dispatch] = React.useReducer(reducer, { expanded: false });
  useDispatcher(state, dispatch);

  React.useEffect(() => {
    async function loadConfig() {
      const { position, expanded } = await browser.storage.local.get();

      dispatch(savePosition(position));
      dispatch(setExpanded(expanded));
    }
    loadConfig();
  }, []);

  return (
    <Layout
      header={(
        <Panel align="space-between">
          <Icons.Close
            height={8}
            width={8}
            onClick={() => {
              browser.storage.local.set({ active: false });
            }}
          />
          <Icons.Expander
            height={8}
            width={8}
            onClick={() => {
              browser.storage.local.set({ expanded: !state.expanded });
              dispatch(setExpanded(!state.expanded));
            }}
            rotate={state.expanded ? 180 : 0}
          />
        </Panel>
      )}
      sidebar={<Sidebar />}
      position={state.position}
    >
      {state.expanded && (
        <Panel align="center" verticalAlign="center">
          <MemoryRouter>
            <Switch>
              <Route path="/" component={ManualTestingPage} />
            </Switch>
          </MemoryRouter>
        </Panel>
      )}
    </Layout>
  );
};
