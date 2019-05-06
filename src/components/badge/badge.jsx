import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './badge.module.scss';

const badge = BEM(styles);

export const Badge = badge(({ className, text }) => <span className={className}>{text}</span>);
