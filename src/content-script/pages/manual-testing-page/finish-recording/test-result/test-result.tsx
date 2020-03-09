import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import styles from './test-result.module.scss';

interface Props {
  className?: string;
  label: string;
  value?: string | number;
}

const testResult = BEM(styles);

export const TestResult = testResult(({ className, label, value }: Props) => (
  <div className={className}>
    <Label>
      {label}
      :
    </Label>
    <Value>{value}</Value>
  </div>
));

const Label = testResult.label('div');
const Value = testResult.value('div');
