import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import {
  Table, Column, Button, Icons, Panel,
} from '@drill4j/ui-kit';

import { useLocalStorage } from '../../hooks';
import { DomainConfig } from '../../types/domain-config';
import { LinkColumn } from './link-column';
import { EditSettingsModal } from './edit-settings-modal';
import { ActionsColumn } from './actions-column';
import { EditSettingsForm } from './edit-settings-form';

import styles from './general-tab.module.scss';

interface Props {
  className?: string;
}

const generalTab = BEM(styles);

export const GeneralTab = generalTab(({ className }: Props) => {
  // const { domains = {} } = useLocalStorage<{ [host: string]: DomainConfig }>('domains') || {};
  // const data = Object.keys(domains).map(host => ({ host, ...domains[host] }));
  // const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  return (
    <div className={className}>
      {/* <Header>Domains</Header> */}
      <Content>
        <EditSettingsForm />
        {/* <Table data={data}>
          <Column
            name="host"
            label="Host"
            Cell={LinkColumn}

          />
          <Column name="drillAgentId" label="Agent ID" />
          <Column
            name="drillAdminUrl"
            label="Admin URL"
            Cell={LinkColumn}
          />
          <Column
            name="actions"
            HeaderCell={() => (
              <Panel align="end">
                <Button type="primary" size="large" onClick={() => setIsEditModalOpen(true)}>
                  <Icons.Add />
                  &nbsp;
                  Add New
                </Button>
              </Panel>

            )}
            Cell={ActionsColumn}
          />
        </Table> */}
      </Content>
      {/* {isEditModalOpen && <EditSettingsModal onToggle={setIsEditModalOpen} />} */}
    </div>
  );
});

const Header = generalTab.header('div');
const Content = generalTab.content('div');
