import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { useHistory } from 'react-router-dom';

import { BuildStatistics } from './build-statistics';

import styles from './test-to-code-page.module.scss';

interface Props {
  className?: string;
}

const testToCodePage = BEM(styles);

export const TestToCodePage = testToCodePage(({ className }: Props) => {
  const { push } = useHistory();
  return (
    <div className={className}>
      <Header>
        Test2Code
      </Header>
      <Content>
        <BuildStatistics />
      </Content>
    </div>
  );
});

const Header = testToCodePage.header('div');
const Content = testToCodePage.content('div');
