import * as React from 'react';
import { Icons } from '@drill4j/ui-kit';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './connection-lost.module.scss';

const connectionLost = BEM(styles);

interface Props {
  className?: string;
}

export const ConnectionLost = connectionLost(({ className }: Props) => (
  <div className={`${className} d-flex align-items-center gx-4`}>
    <div className="d-flex align-items-center gx-1">
      <div className="mr-1 monochrome-default"><Icons.Cancel /></div>
      <span className="bold">Connection lost.</span>
      <span>We’re trying to reconnect. Please wait...</span>
    </div>
  </div>
));
