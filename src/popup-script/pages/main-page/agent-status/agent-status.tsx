import * as React from 'react';
import { BEM, div } from '@redneckz/react-bem-helper';
import { Badge } from '@drill4j/ui-kit';

import styles from './agent-status.module.scss';

interface Props {
  className?: string;
  status?: 'ONLINE' | 'OFFLINE' | 'BUSY';
}

const agentStatus = BEM(styles);

export const AgentStatus = agentStatus(({ className, status }: Props) => (
  <span className={className}>
    <Content status={status}>
      {status && <Badge>{toTitleCase(status)}</Badge>}
    </Content>
  </span>
));

const Content = agentStatus.content(div({} as { status?: 'ONLINE' | 'OFFLINE' | 'BUSY' }));

const toTitleCase = (str: string) => str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
