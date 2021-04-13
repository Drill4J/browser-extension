/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import { Button, FormGroup, Spinner } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';

import { BackendConnectionStatus } from '../../common/enums';
import { useBackendConnectionStatus } from '../../hooks';
import { Fields } from '../fields';
import { composeValidators, required, validateAddress } from '../form-validators';
import * as localStorageUtil from '../../common/util/local-storage';

const validators = composeValidators(
  required('backendAddress', 'Admin URL'),
  validateAddress('backendAddress', 'Admin API URL is not correct. Please enter a valid URL matching the "http(s)://host(:port)" format.'),
);

export const ConnectionForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [initial, setInitial] = React.useState<Record<string, unknown> | null>(null);
  React.useEffect(() => {
    (async () => {
      const data = await localStorageUtil.get('backendAddress');
      setInitial(data);
    })();
  }, []);
  const { data: backendConnectionStatus } = useBackendConnectionStatus();
  const isReconnecting = backendConnectionStatus === BackendConnectionStatus.RECONNECTING;

  return (
    <Form
      initialValues={initial}
      onSubmit={async (data: any) => {
        setIsLoading(true);
        await localStorageUtil.save(data);
      }}
      validate={validators}
      render={({
        handleSubmit, submitting, pristine, invalid,
      }) => (
        <div className="d-flex flex-column gy-6">
          <FormGroup label="Admin API URL">
            <Field
              name="backendAddress"
              component={Fields.Input}
              placeholder="http(s)://host(:port)"
              disabled={submitting || isLoading || isReconnecting}
            />
          </FormGroup>
          <Button
            className="mr-auto"
            type="primary"
            size="large"
            disabled={submitting || pristine || invalid || isLoading || isReconnecting}
            onClick={handleSubmit}
          >
            {(submitting || isLoading) && (
              <>
                <Spinner className="mr-2" />
                <span>Connecting...</span>
              </>
            )}
            {isReconnecting && (
              <>
                <Spinner className="mr-2" />
                <span>
                  Reconnecting...
                </span>
              </>
            )}
            {!submitting && !isLoading && !isReconnecting && 'Connect'}
          </Button>
        </div>
      )}
    />
  );
};
