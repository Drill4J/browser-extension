import * as React from 'react';
import { BEM, tag } from '@redneckz/react-bem-helper';

import packageJson from '../../package.json';

import styles from './options-page.module.scss';

interface Props {
  className?: string;
}

const optionsPage = BEM(styles);

export const App = optionsPage(({ className }: Props) => {
  return (
    <div className={className}>
      <Content>
        <Header>Drill4J Extension Settings</Header>
        <Version>Version: {packageJson.version}</Version>
        <Link
          href="https://github.com/Drill4J/browser-extension/releases"
          target="_blank"
          rel="noopener noreferrer"
        >
          About this version
        </Link>
        <Notification>
          Extension settings are not available yet, but we're working on it. Stay tuned!
        </Notification>
      </Content>
    </div>
  );
});

const Content = optionsPage.content('div');
const Header = optionsPage.header('div');
const Version = optionsPage.version('span');
const Link = optionsPage.link(
  tag('a')({ href: '', target: '', rel: '' } as { href: string; target: string; rel: string }),
);
const Notification = optionsPage.notification('div');
