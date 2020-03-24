import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { useHistory } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import {
  Icons, Panel, Button, OverflowText,
} from '@drill4j/ui-kit';
import axios from 'axios';

import { percentFormatter } from '../../../../utils';
import { useAgentConfig, useActiveScope } from '../../../../hooks';
import { AgentConfig } from '../../../../types/agent-config';
import { Timer } from './timer';
import { TestResult } from '../test-result';

import styles from './in-progress.module.scss';

interface Props {
  className?: string;
}

const inProgress = BEM(styles);

function finishRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false } });
  const { drillAgentId, drillGroupId, sessionId } = config;
  const requestURL = `${drillAgentId ? `/agents/${drillAgentId}` : `/service-groups/${drillGroupId}`}/plugins/test2code/dispatch-action`;
  axios.post(requestURL, {
    type: 'STOP',
    payload: { sessionId },
  });
}

function cancelRecordingSession(activeTab: string, config: AgentConfig) {
  browser.storage.local.set({ [activeTab]: { ...config, isActive: false } });
  const { drillAgentId, drillGroupId, sessionId } = config;
  const requestURL = `${drillAgentId ? `/agents/${drillAgentId}` : `/service-groups/${drillGroupId}`}/plugins/test2code/dispatch-action`;
  axios.post(requestURL, {
    type: 'CANCEL',
    payload: { sessionId },
  });
}

export const InProgress = inProgress(({ className }: Props) => {
  const { push } = useHistory();
  const activeTab = window.location.host;
  const config = useAgentConfig() || {};
  const scope: any = useActiveScope(config.drillAdminUrl);

  return (
    <div className={className}>
      <Header>
        <OverflowText>{config.testName}</OverflowText>
      </Header>
      <Content>
        <TestResultsPanel>
          <TestResult label="Test time" value={<Timer />} color="blue" />
          <TestResult label="Code coverage" value={`${percentFormatter(scope?.coverage?.ratio || 0)}%`} color="blue" />
          <TestResult label="Risks methods covered" value={scope?.coverage?.riskCount?.covered} color="red" />
          <TestResult label="Total methods covered" value={scope?.coverage?.methodCount?.covered} color="blue" />
        </TestResultsPanel>
        <Panel align="space-between">
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
              push('/manual-testing');
            }}
            type="secondary"
            size="large"
          >
            Cancel test
          </CancelButton>
        </Panel>
      </Content>
    </div>
  );
});

const Header = inProgress.header('div');
const Content = inProgress.content('div');
const TestResultsPanel = inProgress.testResultsPanel('div');
const FinishButton = inProgress.finishButton(Button);
const FinishButtonIcon = inProgress.finishButtonIcon(Icons.Check);
const CancelButton = inProgress.cancelButton(Button);
