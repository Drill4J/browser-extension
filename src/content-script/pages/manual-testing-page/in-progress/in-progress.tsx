import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';

import { Icons, Button, OverflowText } from '../../../../components';
import { useAgentConfig } from '../../../../hooks';
import { AgentConfig } from '../../../../types/agent-config';
import { Timer } from './timer';

import styles from './in-progress.module.scss';

interface Props extends RouteComponentProps {
  className?: string;
}

const inProgress = BEM(styles);

function finishRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false, timerStart: 0 } });
  const { drillAgentId, drillGroupId, sessionId } = config;
  const requestURL = `${drillAgentId ? `/agents/${drillAgentId}` : `/service-group/${drillGroupId}/plugin`}/test-to-code-mapping/dispatch-action`;
  axios.post(requestURL, {
    type: 'STOP',
    payload: { sessionId },
  });
}

function cancelRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false, timerStart: 0 } });
  const { drillAgentId, drillGroupId, sessionId } = config;
  const requestURL = `${drillAgentId ? `/agents/${drillAgentId}` : `/service-group/${drillGroupId}/plugin`}/test-to-code-mapping/dispatch-action`;
  axios.post(requestURL, {
    type: 'CANCEL',
    payload: { sessionId },
  });
}

export const InProgress = withRouter(
  inProgress(({ className, history: { push } }: Props) => {
    const activeTab = window.location.host;
    const config = useAgentConfig() || {};
    return (
      <div className={className}>
        <Header>
          <OverflowText>{config.testName}</OverflowText>
        </Header>
        <Content>
          <Icons.Stopwatch />
          <TimerWrapper>
            <Timer />
          </TimerWrapper>
          <Instructions>Recording and analyzing your code coverage ...</Instructions>
          <FinishButton
            type="secondary"
            onClick={() => {
              finishRecordingSession(activeTab, config);
              push('/manual-testing/finish-recording');
            }}
          >
            <FinishButtonIcon height={16} width={16} />
            Finish testing
          </FinishButton>
          <CancelButton
            onClick={() => {
              cancelRecordingSession(activeTab, config);
              push('/manual-testing/start-recording');
            }}
          >
            Cancel
          </CancelButton>
        </Content>
      </div>
    );
  }),
);

const Header = inProgress.header('div');
const Content = inProgress.content('div');
const TimerWrapper = inProgress.timerWrapper('div');
const Instructions = inProgress.instructions('div');
const FinishButton = inProgress.finishButton(Button);
const FinishButtonIcon = inProgress.finishButtonIcon(Icons.Checkbox);
const CancelButton = inProgress.cancelButton('div');
