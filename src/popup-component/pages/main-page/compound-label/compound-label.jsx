import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './compound-label.module.scss';

const compoundLabel = BEM(styles);

export const CompoundLabel = compoundLabel(({ className, firstLabel, secondLabel }) => (
  <span className={className}>
    <Content>
      <ClassName>{firstLabel}</ClassName>
      <ClassPath>{secondLabel}</ClassPath>
    </Content>
  </span>
));

const Content = compoundLabel.content('div');
const ClassName = compoundLabel.firstLabel('span');
const ClassPath = compoundLabel.secondLabel('span');
