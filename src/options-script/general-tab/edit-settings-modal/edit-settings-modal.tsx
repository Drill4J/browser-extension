import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import {
  Popup, FormGroup, Button, Panel,
} from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';
import { browser } from 'webextension-polyfill-ts';

import { Fields, composeValidators, required } from '../../../forms';
import { DomainConfig } from '../../../types/domain-config';

import styles from './edit-settings-modal.module.scss';

interface Props {
  className?: string;
  domain?: DomainConfig;
  onToggle: (value: boolean) => void;
}

const editSettingsModal = BEM(styles);

const validateDomain = composeValidators(
  required('host'),
  required('drillAdminUrl', 'Admin URL'),
  required('drillAgentId', 'Agent ID'),
);

export const EditSettingsModal = editSettingsModal(({ className, domain = {}, onToggle }: Props) => (
  <div className={className}>
    <Popup isOpen onToggle={onToggle} type="info" header={domain.drillAgentId ? 'Edit Domain' : 'Add New Domain'}>
      <Content>
        <Form
          initialValues={{ ...domain }}
          onSubmit={saveDomain(onToggle)}
          validate={validateDomain as any}
          render={({
            handleSubmit, submitting, pristine, invalid,
          }) => (
            <>
              <FormGroup label="Host">
                <Field
                  name="host"
                  component={Fields.Input}
                  placeholder="Insert your host here"
                />
              </FormGroup>
              <FormGroup label="Agent ID">
                <Field
                  name="drillAgentId"
                  component={Fields.Input}
                  placeholder="Specify your agent ID"
                />
              </FormGroup>
              <FormGroup label="Admin URL">
                <Field
                  name="drillAdminUrl"
                  component={Fields.Input}
                  placeholder="protocol://hostname:port"
                />
              </FormGroup>
              <FormGroup label="Agent Type">
                <Field
                  name="drillAgentType"
                  component={Fields.Dropdown}
                  options={[{ value: 'JS', label: 'JS' }, { value: 'Java', label: 'Java' }]}
                />
              </FormGroup>
              <ActionsPanel>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={submitting || pristine || invalid}
                >
                  Save
                </Button>
                <Button
                  type="secondary"
                  size="large"
                  onClick={() => onToggle(false)}
                >
                  Cancel
                </Button>
              </ActionsPanel>
            </>
          )}
        />
      </Content>
    </Popup>
  </div>
));

const Content = editSettingsModal.content('div');
const ActionsPanel = editSettingsModal.actionsPanel(Panel);

function saveDomain(callback: (value: boolean) => void) {
  return async ({ host, ...rest }: { host: string} & DomainConfig) => {
    const { domains } = await browser.storage.local.get('domains');
    await browser.storage.local.set({ domains: { ...domains, [host]: { ...rest, custom: true } } });
    callback(false);
  };
}
