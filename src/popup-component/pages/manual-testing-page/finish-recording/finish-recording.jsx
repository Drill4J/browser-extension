import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter } from 'react-router-dom';

import { Button } from '../../../../components';
import { Panel } from '../../../../layouts';
import { useLocalStorage } from '../../../../hooks';

import styles from './finish-recording.module.scss';

const finishRecording = BEM(styles);

export const FinishRecording = withRouter(
  finishRecording(({ className, history: { push } }) => {
    const { testName } = useLocalStorage('testName') || {};

    return (
      <div className={className}>
        <Header>{testName}</Header>
        <Content>
          <Title>Testing finished</Title>
          <Instructions>
            More information here if necessary. Maybe instructions to go to full page widget to see
            results, etc.
          </Instructions>
          <Panel>
            <ViewResultsButton
              type="secondary"
              onClick={() => window.open('http://localhost:3000/full-page/MySuperAgent/coverage')}
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
