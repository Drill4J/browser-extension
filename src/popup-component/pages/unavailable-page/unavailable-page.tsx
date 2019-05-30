import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import { Icons } from '../../../components';

import styles from './unavailable-page.module.scss';

interface Props {
  className?: string;
}

const unavailablePage = BEM(styles);

export const UnavailablePage = unavailablePage(({ className }: Props) => (
  <div className={className}>
    <Content>
      <LogoWrapper>
        <Icons.Logo />
      </LogoWrapper>
      <Title>Drill4J not found</Title>
      <Instructions>If an agent is installed on this site, try refreshing the page.</Instructions>
    </Content>
  </div>
));

const Content = unavailablePage.content('div');
const Title = unavailablePage.title('div');
const Instructions = unavailablePage.instructions('div');
const LogoWrapper = unavailablePage.logoWrapper('div');
