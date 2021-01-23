import * as React from 'react';
import { Button, FormGroup, Spinner } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';

import { Fields, composeValidators, required } from '../../../../forms';
import * as localStorageUtil from '../../../../common/util/local-storage';

interface Props {
  initial: Record<string, unknown> | null;
}

const validateDomain = composeValidators(
  required('backendAddress', 'Admin URL'),
);

export const ConnectionForm = ({ initial }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Form
      initialValues={initial}
      onSubmit={async (data: any) => {
        setIsLoading(true);
        await localStorageUtil.save(data);
      }}
      validate={validateDomain}
      render={({
        handleSubmit, submitting, pristine, invalid,
      }) => (
        <div className="d-flex flex-column gy-6">
          <FormGroup label="Admin API URL">
            <Field
              name="backendAddress"
              component={Fields.Input}
              placeholder="protocol://hostname:port"
              validate={(value = '') => (value
                // eslint-disable-next-line no-useless-escape
                .replace(/^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$/, '')
                ? 'Must be a URL'
                : undefined)}
            />
          </FormGroup>
          <Button
            className="mr-auto"
            type="primary"
            size="large"
            disabled={submitting || pristine || invalid || isLoading}
            onClick={handleSubmit}
          >
            {submitting || isLoading
              ? (
                <>
                  <Spinner />
                  <span>Connecting...</span>
                </>
              )
              : 'Connect'}
          </Button>
        </div>
      )}
    />
  );
};
