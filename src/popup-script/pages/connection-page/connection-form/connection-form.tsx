import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Button, FormGroup, Spinner } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';

import { Fields, composeValidators, required } from '../../../../forms';
import * as localStorageUtil from '../../../../common/util/local-storage';

import styles from '../connection-page.module.scss';

interface Props {
  className?: string;
  initial: Record<string, unknown> | null;
}

const validateDomain = composeValidators(
  required('backendAddress', 'Admin URL'),
);

export const ConnectionForm = BEM(styles)(({ className, initial }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <div className={`${className} d-flex flex-column h-100 justify-content-center px-4 gy-8`}>
      <Info>
        No conection with backend. Try to refresh the page or connect using your admin
        <br />
        address.
      </Info>
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
    </div>
  );
});

const Info = BEM(styles).info('div');
