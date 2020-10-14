import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { useHistory } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import {
  Icons, Panel, Button, OverflowText,
} from '@drill4j/ui-kit';
import axios from 'axios';
import { Agent } from 'types/agent';

import { percentFormatter } from '../../../../utils';
import { useAgentConfig, useActiveScope, useJsAgentInGroup } from '../../../../hooks';
import { DomainConfig } from '../../../../types/domain-config';
import { Timer } from './timer';
import { TestResult } from '../test-result';

import styles from './in-progress.module.scss';

interface Props {
  className?: string;
}

const inProgress = BEM(styles);

async function finishRecordingSession(activeTab: string, config: DomainConfig, jsAgentInGroup: Agent | null) {
  const {
    drillAgentId, drillGroupId, sessionId, drillAgentType = 'Java', testName,
  } = config;

  const isJsRecordingInProgress = await browser.runtime.sendMessage({ action: 'IS_JS_RECORDING_IN_PROGRESS' });
  if (isJsRecordingInProgress) {
    try {
      let agentId;
      if (drillAgentType === 'JS') {
        agentId = drillAgentId;
      } else if (jsAgentInGroup) {
        agentId = jsAgentInGroup?.id;
      } else {
        // TODO something went badly wrong, e.g. user wiped config during test session
        // eslint-disable-next-line no-console
        console.error('JS agent - no id found', 'drillAgentType', drillAgentType, 'jsAgentInGroup', jsAgentInGroup);
      }

      const { coverage, scriptSources } = await browser.runtime.sendMessage({ action: 'FINISH_TEST', testName });
      const data = JSON.stringify({ coverage, scriptSources });

      await axios.post(`/agents/${agentId}/plugins/test2code/dispatch-action`, {
        type: 'ADD_SESSION_DATA',
        payload: {
          sessionId,
          data,
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('ADD_SESSION_DATA failed', e);
    }
  }

  const requestURL = `${drillAgentId ? `/agents/${drillAgentId}` : `/service-groups/${drillGroupId}`}/plugins/test2code/dispatch-action`;
  await axios.post(requestURL, {
    type: 'STOP',
    payload: { sessionId },
  });

  const { domains } = await browser.storage.local.get('domains') || {};
  browser.storage.local.set({ domains: { ...domains, [activeTab]: { ...config, isActive: false } } });
}

async function cancelRecordingSession(activeTab: string, config: DomainConfig) {
  const { domains } = await browser.storage.local.get('domains') || {};
  browser.storage.local.set({ domains: { ...domains, [activeTab]: { ...config, isActive: false } } });
  const { drillAgentId, drillGroupId, sessionId } = config;
  const requestURL = `${drillAgentId ? `/agents/${drillAgentId}` : `/service-groups/${drillGroupId}`}/plugins/test2code/dispatch-action`;
  await axios.post(requestURL, {
    type: 'CANCEL',
    payload: { sessionId },
  });
}

export const InProgress = inProgress(({ className }: Props) => {
  const { push } = useHistory();
  const activeTab = window.location.host;
  const config = useAgentConfig() || {};
  const scope: any = useActiveScope(config.drillAdminUrl);
  const jsAgentInGroup = useJsAgentInGroup();

  // TODO page refresh will break that
  const [isRequestInProgress, updateRequestStatus] = React.useState(false);

  return (
    <div className={className}>
      <Header>
        <OverflowText>{config.testName}</OverflowText>
      </Header>
      <Content>
        {!isRequestInProgress && (
          <TestTimer>
            <Icons.Stopwatch width={22} height={24} />
            <Timer />
          </TestTimer>
        )}
        {config.drillGroupId ? (
          <WarningMessage>
            Realtime coverage collection is unavailable for service groups.
          </WarningMessage>
        )
          : (
            <>
              <ResultsLabel>Active scope statistics</ResultsLabel>
              <TestResultsPanel>
                <TestResult label="Scope coverage" value={`${percentFormatter(scope?.coverage?.percentage || 0)}%`} color="blue" />
                <TestResult label="Risks methods covered" value={scope?.coverage?.riskCount?.covered} color="red" />
                <TestResult label="Total methods covered" value={scope?.coverage?.methodCount?.covered} color="blue" />
              </TestResultsPanel>
            </>
          )}
        {!isRequestInProgress && (
          <Panel align="space-between">
            <FinishButton
              type="secondary"
              onClick={async () => {
                updateRequestStatus(true);
                try {
                  await finishRecordingSession(activeTab, config, jsAgentInGroup);
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error('finish recording session failed', e);
                }
                updateRequestStatus(false);
                push('/manual-testing/finish-recording');
              }}
            >
              <FinishButtonIcon height={16} width={16} />
              Finish testing
            </FinishButton>
            <CancelButton
              onClick={async () => {
              // FIXME update request status
                await cancelRecordingSession(activeTab, config);
                push('/manual-testing');
              }}
              type="secondary"
              size="large"
            >
              Cancel test
            </CancelButton>
          </Panel>
        )}
        {isRequestInProgress && (
          <PendingRequestMessage>
            <Spinner />
            <div>Sending data...</div>
          </PendingRequestMessage>
        )}
      </Content>
    </div>
  );
});

const PendingRequestMessage = inProgress.pendingRequestMessage('div');
const Spinner = inProgress.spinner('div');
const Header = inProgress.header('div');
const Content = inProgress.content('div');
const TestTimer = inProgress.testTimer(Panel);
const WarningMessage = inProgress.warningMessage('span');
const ResultsLabel = inProgress.resultsLabel('div');
const TestResultsPanel = inProgress.testResultsPanel('div');
const FinishButton = inProgress.finishButton(Button);
const FinishButtonIcon = inProgress.finishButtonIcon(Icons.Check);
const CancelButton = inProgress.cancelButton(Button);
