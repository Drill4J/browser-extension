import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { useHistory } from 'react-router-dom';

import { useAgentConfig, useAgentInfo } from '../../../hooks';
import { BusyAgentLogo } from './busy-agent-logo';
import { OfflineAgentLogo } from './offline-agent-logo';

import styles from './unavailable-page.module.scss';

interface Props {
  className?: string;
}

const busyAgentPage = BEM(styles);

export const UnavailablePage = busyAgentPage(({ className }: Props) => {
  const config = useAgentConfig();
  const { status = '' } = useAgentInfo(config?.drillAdminUrl, config?.drillAgentId) || {};
  const { push } = useHistory();

  React.useEffect(() => {
    status === 'ONLINE' && push('/manual-testing');
  }, [status]);

  return (
    <div className={className}>
      {status === 'BUSY' ? <BusyAgentLogo style={{ opacity: '40%' }} /> : <OfflineAgentLogo style={{ opacity: '40%' }} />}
      <Header>
        {`Agent is ${status.toLowerCase()}`}
      </Header>
      <Content>
        Come back when it’s online again.
        Manual test cannot be recorded while the agent is&nbsp;
        {status.toLowerCase()}
        .
      </Content>
    </div>
  );
});

const Header = busyAgentPage.header('div');
const Content = busyAgentPage.content('div');
