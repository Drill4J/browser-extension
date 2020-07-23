import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './link-column.module.scss';

interface Props {
  className?: string;
  value?: string;
  convertToUrl: boolean;
}

const linkColumn = BEM(styles);

export const LinkColumn = linkColumn(({ className, value, convertToUrl = true }: Props) => {
  const url = `http://${value}`;
  return (
    <a className={className} href={url} target="_blank" rel="noopener noreferrer">
      {convertToUrl ? url : value}
    </a>
  );
});
