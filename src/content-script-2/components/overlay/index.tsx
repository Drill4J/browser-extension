import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './overlay.module.scss';

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export const Overlay = BEM(styles)(({ children, className }: Props) => <div className={className}>{children}</div>);
