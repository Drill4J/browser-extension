import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import { Logo } from '../../logo';

import styles from './agent-not-found.module.scss';

interface Props {
  className?: string;
}

const agentNotFound = BEM(styles);

export const AgentNotFound = agentNotFound(({ className }: Props) => (
  <div className={`${className} d-flex flex-column h-100 justify-content-center align-items-center px-4 gy-6`}>
    <Logo viewBox="0 0 64 64" width={80} height={80} />
    <div className="d-flex flex-column gy-2 text-center">
      <span>Agent not found</span>
      <Instructions>If an agent is installed on this site, try refreshing the page.</Instructions>
    </div>
  </div>
));

const Instructions = agentNotFound.instructions('div');
