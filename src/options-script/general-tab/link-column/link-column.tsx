import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './link-column.module.scss';

interface Props {
  className?: string;
  value?: string;
  convertToUrl: boolean;
}

const linkColumn = BEM(styles);

export const LinkColumn = linkColumn(({ className, value }: Props) => (
  <a className={className} href={value} target="_blank" rel="noopener noreferrer">
    {value}
  </a>
));
