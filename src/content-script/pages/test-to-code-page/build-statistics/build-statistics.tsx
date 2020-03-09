import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Panel } from '@drill4j/ui-kit';

import styles from './build-statistics.module.scss';

interface Props {
  className?: string;
}

const buildStatistics = BEM(styles);

export const BuildStatistics = buildStatistics(({ className }: Props) => (
  <div className={className}>
    <Header>Build statistics</Header>
    <Panel align="space-between">
      <Label>Code coverage</Label>
      <Value>0%</Value>
    </Panel>
    <Panel align="space-between">
      <Label>Covered methods:</Label>
      <Value>0</Value>
    </Panel>
    <Panel align="space-between">
      <Label>Risk methods to cover:</Label>
      <Value>0</Value>
    </Panel>
    <Panel align="space-between">
      <Label>Total methods to cover:</Label>
      <Value>0</Value>
    </Panel>
  </div>
));

const Header = buildStatistics.header('div');
const Label = buildStatistics.label('div');
const Value = buildStatistics.value('div');
