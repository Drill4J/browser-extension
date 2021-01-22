import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Badge } from '@drill4j/ui-kit';

import { Status } from 'background/types';

import styles from './agent-status.module.scss';

interface Props {
  className?: string;
  status: Status;
}

const agentStatus = BEM(styles);

export const AgentStatus = agentStatus(({ className, status }: Props) => (
  <span className={className}>
    {status && <Badge>{toTitleCase(status)}</Badge>}
  </span>
));

const toTitleCase = (str: string) => str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
