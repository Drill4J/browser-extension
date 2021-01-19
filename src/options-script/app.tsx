import * as React from 'react';
import { BEM, tag } from '@redneckz/react-bem-helper';
import { TabsPanel, Tab } from '@drill4j/ui-kit';

import packageJson from '../../package.json';
import { GeneralTab } from './general-tab';

import '../bootstrap-imports.scss';
import styles from './options-page.module.scss';

interface Props {
  className?: string;
}

const optionsPage = BEM(styles);

export const App = optionsPage(({ className }: Props) => (
  <div className={className}>
    <Content>
      <Header>Drill4J Extension Settings</Header>
      <Info>
        <Version>
          {`Version: ${packageJson.version}`}
        </Version>
        <Link
          href="https://github.com/Drill4J/browser-extension/releases"
          target="_blank"
          rel="noopener noreferrer"
        >
          About this version
        </Link>
      </Info>
      <TabsPanel activeTab="general" onSelect={() => {}}>
        <Tab name="general">General</Tab>
      </TabsPanel>
      <GeneralTab />
    </Content>
  </div>
));

const Content = optionsPage.content('div');
const Header = optionsPage.header('div');
const Info = optionsPage.info('div');
const Version = optionsPage.version('span');
const Link = optionsPage.link(
  tag('a')({ href: '', target: '', rel: '' } as { href: string; target: string; rel: string }),
);
