import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Parser from 'html-react-parser';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';

import { TOKEN_HEADER } from '../../../common/constants';
import { Button, Input, Icons } from '../../../components';
import Logo from './logo-inline.svg';

import styles from './login-page.module.scss';

interface Props extends RouteComponentProps {
  className?: string;
}

const loginPage = BEM(styles);

export const LoginPage = withRouter(
  loginPage(({ className, history: { push } }: Props) => (
    <div className={className}>
      <LogoWrapper>{Parser(Logo)}</LogoWrapper>
      <Content>
        <WelcomeMessage>Sign in to Drill4J</WelcomeMessage>
        <Credentials>
          <Input placeholder="User ID" disabled rounded icon={<Icons.Account />} />
          <Input placeholder="Password" disabled rounded icon={<Icons.Lock />} />
        </Credentials>
        <Actions>
          <ActionButton type="primary" disabled>
            Sign in
          </ActionButton>
          <ForgotPassword>Forgot your password?</ForgotPassword>
          <ActionButton type="secondary" onClick={() => handleLogin(push)}>
            Continue as a guest (read only)
          </ActionButton>
        </Actions>
      </Content>
    </div>
  )),
);

const LogoWrapper = loginPage.logoWrapper('div');
const Content = loginPage.content('div');
const WelcomeMessage = loginPage.message('div');
const Credentials = loginPage.credentials('div');
const Actions = loginPage.actions('div');
const ActionButton = loginPage.actionButton(Button);
const ForgotPassword = loginPage.forgotPassword('div');

function handleLogin(push: (path: string, state?: any) => void) {
  axios.post('/login').then((response) => {
    const authToken = response.headers[TOKEN_HEADER.toLowerCase()];
    if (authToken) {
      browser.storage.local.set({ token: authToken });
    }
    push('/');
  });
}
