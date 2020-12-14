import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import {
  FormGroup, Button, Panel,
} from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';

import { Fields, composeValidators, required } from '../../../forms';
import * as localStorageUtil from '../../../common/util/local-storage';
import styles from './edit-settings-form.module.scss';

interface Props {
  className?: string;
}

const editSettingsForm = BEM(styles);

const validateDomain = composeValidators(
  required('backendAddress', 'Admin URL'),
);

export const EditSettingsForm = editSettingsForm(({ className }: Props) => {
  const [initial, setInitial] = React.useState<Record<string, any> | null>(null);
  React.useEffect(() => {
    (async () => {
      const data = await localStorageUtil.get('backendAddress');
      setInitial(data);
    })();
  });
  return (
    <div className={className}>
      <Form
        initialValues={initial}
        onSubmit={async (data: any) => {
          await localStorageUtil.save(data);
        }}
        validate={validateDomain as any}
        render={({
          handleSubmit, submitting, pristine, invalid, form,
        }) => (
          <>
            <FormGroup label="Admin API URL">
              <Field
                name="backendAddress"
                component={Fields.Input}
                placeholder="protocol://hostname:port"
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
                onClick={() => {
                  form.reset();
                }}
              >
                Cancel
              </Button>
            </ActionsPanel>
          </>
        )}
      />
    </div>
  );
});

const ActionsPanel = editSettingsForm.actionsPanel(Panel);
