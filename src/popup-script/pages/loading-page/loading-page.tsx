import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Icons } from '@drill4j/ui-kit';

import styles from './loading-page.module.scss';

interface Props {
  className?: string;
}

const loadingPage = BEM(styles);

export const LoadingPage = loadingPage(({ className }: Props) => (
  <div className={className}>
    <Content>
      <LogoWrapper>
        <Icons.Logo />
      </LogoWrapper>
      <Title>Loading…</Title>
      <Instructions>Please wait while we prepare your data.</Instructions>
    </Content>
  </div>
));

const Content = loadingPage.content('div');
const Title = loadingPage.title('div');
const Instructions = loadingPage.instructions('div');
const LogoWrapper = loadingPage.logoWrapper('div');
