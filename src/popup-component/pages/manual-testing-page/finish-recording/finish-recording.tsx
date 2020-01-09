import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Button, OverflowText } from '../../../../components';
import { Panel } from '../../../../layouts';
import { useAgentConfig } from '../../../../hooks';

import styles from './finish-recording.module.scss';

interface Props extends RouteComponentProps {
  className?: string;
}

const finishRecording = BEM(styles);

export const FinishRecording = withRouter(
  finishRecording(({ className, history: { push } }: Props) => {
    const { agentId = '', testName = '', adminUrl = '' } = useAgentConfig() || {};

    return (
      <div className={className}>
        <Header>
          <OverflowText>{testName}</OverflowText>
        </Header>
        <Content>
          <Title>Testing finished</Title>
          <Instructions>
            When you click on the &quot;View results&quot; button, a tab with detailed information
            about the code coverage will open.
          </Instructions>
          <Panel>
            <ViewResultsButton
              type="secondary"
              onClick={() =>
                window.open(
                  `${getCorrectAdminUrl(
                    adminUrl,
                  )}/full-page/${agentId}/test-to-code-mapping/dashboard`,
                )
              }
            >
              View results
            </ViewResultsButton>
            <StartNewTest type="secondary" onClick={() => push('/manual-testing/start-recording')}>
              Start another test
            </StartNewTest>
          </Panel>
        </Content>
      </div>
    );
  }),
);

const Header = finishRecording.header('div');
const Content = finishRecording.content('div');
const Title = finishRecording.title('div');
const Instructions = finishRecording.instructions('div');
const ViewResultsButton = finishRecording.viewResultsButton(Button);
const StartNewTest = finishRecording.startNewTest(Button);

function getCorrectAdminUrl(adminUrl: string) {
  const { hostname } = new URL(`http://${adminUrl}`);
  return `${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${hostname}:${
    process.env.NODE_ENV === 'development' ? 3000 : 9443
  }`;
}
