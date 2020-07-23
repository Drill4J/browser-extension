import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Icons } from '@drill4j/ui-kit';
import { browser } from 'webextension-polyfill-ts';

import { DomainConfig } from '../../../types/domain-config';
import { EditSettingsModal } from '../edit-settings-modal';

import styles from './actions-column.module.scss';

interface Props {
  className?: string;
  item?: {host: string} & DomainConfig;
}

const actionsColumn = BEM(styles);

export const ActionsColumn = actionsColumn(({ className, item }: Props) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  return (
    <div className={className}>
      <Icons.Edit onClick={() => setIsEditModalOpen(true)} />
      <Icons.Delete onClick={() => item?.host && removeDomain(item.host)} />
      {isEditModalOpen && (
        <EditSettingsModal
          onToggle={setIsEditModalOpen}
          domain={item}
        />
      )}
    </div>
  );
});

async function removeDomain(host: string) {
  const { domains } = await browser.storage.local.get('domains');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [host]: currentValue, ...rest } = domains;
  await browser.storage.local.set({ domains: { ...rest } });
}
