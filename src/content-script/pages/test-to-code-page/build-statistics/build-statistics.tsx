import * as React from 'react';
import { BEM, div } from '@redneckz/react-bem-helper';
import { Panel, Icons } from '@drill4j/ui-kit';

import { useBuildCoverage, useAgentConfig } from '../../../../hooks';
import { percentFormatter } from '../../../../utils';

import styles from './build-statistics.module.scss';

interface Props {
  className?: string;
}

const buildStatistics = BEM(styles);

export const BuildStatistics = buildStatistics(({ className }: Props) => {
  const config = useAgentConfig() || {};
  const {
    ratio = 0,
    methodCount: { total: totalMethodCount = 0, covered: coveredMethodCount = 0 } = {},
    riskCount: { total: totalRiskCount = 0, covered: coveredRiskCount = 0 } = {},
  }: any = useBuildCoverage(config.drillAdminUrl) || {};

  return (
    <div className={className}>
      <Header>Build statistics</Header>
      <Panel align="space-between">
        <Label>Code coverage</Label>
        <Value>
          {percentFormatter(ratio)}
          %
        </Value>
      </Panel>
      <Panel align="space-between">
        <Label>Covered methods:</Label>
        <Value>{coveredMethodCount}</Value>
      </Panel>
      <Panel align="space-between">
        <Label>Risk methods to cover:</Label>
        <Value color="red">{totalRiskCount - coveredRiskCount}</Value>
      </Panel>
      <Panel align="space-between">
        <Label>Total methods to cover:</Label>
        <Value>{totalMethodCount - coveredMethodCount}</Value>
      </Panel>
      <Instruction>
        <InfoIcon>
          <Icons.Info height={16} width={16} />
        </InfoIcon>
        To update your build statistics with tests results finish the scope on your agent web page.
      </Instruction>
    </div>
  );
});

const Header = buildStatistics.header('div');
const Label = buildStatistics.label('div');
const Value = buildStatistics.value(div({} as { color?: 'red'}));
const Instruction = buildStatistics.instruction(Panel);
const InfoIcon = buildStatistics.infoIcon('div');
