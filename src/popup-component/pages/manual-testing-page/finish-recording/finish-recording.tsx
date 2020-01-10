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
    const { testName = '' } = useAgentConfig() || {};

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
          <Panel align="center">
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
const StartNewTest = finishRecording.startNewTest(Button);
