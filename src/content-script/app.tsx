/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// TODO a11y in future extension interations
import * as React from 'react';
import { MemoryRouter, Route, Redirect } from 'react-router-dom';
import { DraggableEventHandler } from 'react-draggable';
import { Panel, PanelSpread, Icons } from '@drill4j/ui-kit';
import { browser } from 'webextension-polyfill-ts';
import { Layout } from './layouts';
import { useDispatcher } from './hooks';
import {
  reducer, savePosition, setExpanded, setInitial, setIsWidgetVisible, setCorner,
} from './reducer';
import { Sidebar } from './sidebar';
import { ManualTestingPage, TestToCodePage } from './pages';
import { withAgentContext, AgentContext } from './context/agent-context';

export const App = withAgentContext((props: any) => {
  const { host } = props;
  console.log('Content app.tsx', props);

  const [state, dispatch] = React.useReducer(reducer(async (newState: any) => {
    console.log('newState', newState);
    await browser.storage.local.set({ [host]: newState });
  }), { expanded: false });
  console.log('APP STATE:', state);
  useDispatcher(state, dispatch);

  React.useEffect(() => {
    async function loadConfig() {
      const { [host]: data } = await browser.storage.local.get(host);
      dispatch(setInitial(data));
    }
    loadConfig();
  }, []);

  const handlePositionChange: DraggableEventHandler = (e, { x, y }) => {
    dispatch(savePosition({ x, y }));
  };

  // TODO remove unused <AgentContext.Consumer>
  return (
    <MemoryRouter>
      <AgentContext.Consumer>
        {agent => (
          <Layout
            header={(
              <Panel align="space-between">
                <div
                  style={{ cursor: 'pointer', padding: '7px' }}
                  onClick={() => dispatch(setIsWidgetVisible(false))}
                >
                  <Icons.Close
                    height={10}
                    width={10}
                  />
                </div>
                <PanelSpread>
                  <div className="drag-wrapper" style={{ height: '24px' }} />
                </PanelSpread>
                { state.expanded && (
                  <div
                    style={{ cursor: 'pointer', padding: '7px' }}
                    onClick={() => dispatch(setCorner(state.corner))}
                  >
                    <Icons.GridLayout
                      height={10}
                      width={10}
                    />
                  </div>
                )}
                <div
                  style={{ cursor: 'pointer', padding: '7px' }}
                  onClick={() => dispatch(setExpanded(!state.expanded))}
                >
                  <Icons.Expander
                    height={10}
                    width={10}
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
                {/* <Route path="/test-to-code" component={TestToCodePage} /> */}
              </Panel>
            )}
          </Layout>
        )}
      </AgentContext.Consumer>
    </MemoryRouter>
  );
});
