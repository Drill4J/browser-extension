import React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './generic-icon.module.scss';

function mapPath(path = '', mapper) {
  return path
    .split(/[\r\n]+/)
    .filter(Boolean)
    .map(mapper);
}

export const GenericIcon = BEM(styles)(({ path, rotate = 0, ...rest }) => (
  <svg
    {...rest}
    transform={`rotate(${rotate})`}
    style={{ WebkitTransform: `rotate(${rotate}deg)` }}
  >
    {mapPath(path, (d, key) => (
      <path d={d} key={key} />
    ))}
  </svg>
));
