import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Icons } from '@drill4j/ui-kit';

import styles from './agent-is-offline.module.scss';

const agentIsOffline = BEM(styles);

interface Props {
  className?: string;
}

export const AgentIsOffline = agentIsOffline(({ className }: Props) => (
  <div className={`${className} d-flex align-items-center gx-1`}>
    <div className="mr-1 monochrome-default"><Icons.Cancel /></div>
    <Message>Agent appears to be offline or busy.</Message>
    <span>To start testing your agent has to be registered and online.</span>
  </div>
));

const Message = agentIsOffline.message('span');
