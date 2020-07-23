import * as React from 'react';
import { MemoryRouter, Route, Redirect } from 'react-router-dom';
import { DraggableEventHandler } from 'react-draggable';
import { Panel, PanelSpread, Icons } from '@drill4j/ui-kit';
import { browser } from 'webextension-polyfill-ts';

import { Layout } from './layouts';
import { useDispatcher } from './hooks';
import { reducer, savePosition, setExpanded } from './reducer';
import { Sidebar } from './sidebar';
import { ManualTestingPage, TestToCodePage } from './pages';

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

  const handlePositionChange: DraggableEventHandler = (e, { x, y }) => {
    browser.storage.local.set({ position: { x, y } });
    dispatch(savePosition({ x, y }));
  };

  return (
    <MemoryRouter>
      <Layout
        header={(
          <Panel align="space-between">
            <div style={{ cursor: 'pointer' }}>
              <Icons.Close
                height={8}
                width={8}
                onClick={() => {
                  browser.storage.local.set({ active: false });
                }}
              />
            </div>
            <PanelSpread>
              <div className="drag-wrapper" style={{ height: '24px' }} />
            </PanelSpread>
            <div style={{ cursor: 'pointer' }}>
              <Icons.Expander
                height={8}
                width={8}
                onClick={() => {
                  browser.storage.local.set({ expanded: !state.expanded });
                  dispatch(setExpanded(!state.expanded));
                }}
                rotate={state.expanded ? 180 : 0}
              />
            </div>
          </Panel>
        )}
        sidebar={<Sidebar />}
        position={state.position}
        onPositionChange={handlePositionChange}
      >
        {state.expanded && (
          <Panel align="center" verticalAlign="center">
            <ManualTestingPage />
            <Route path="/test-to-code" component={TestToCodePage} />
          </Panel>
        )}
      </Layout>
    </MemoryRouter>
  );
};
