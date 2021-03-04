/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import { Button, FormGroup, Spinner } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';

import { BackendConnectionStatus } from '../../common/enums';
import { useBackendConnectionStatus } from '../../hooks';
import { Fields } from '../fields';
import { composeValidators, required, validateBackendAdress } from '../form-validators';
import { parseURL } from '../../utils';
import * as localStorageUtil from '../../common/util/local-storage';

const validateDomain = composeValidators(
  required('backendAddress', 'Admin URL'),
  validateBackendAdress('backendAddress'),
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
      validate={validateDomain}
      render={({
        handleSubmit, submitting, pristine, invalid, values: { backendAddress = '' } = {},
      }) => {
        const prevValueRef = React.useRef('');

        React.useEffect(() => {
          prevValueRef.current = backendAddress;
        });
        const prevValue = prevValueRef.current;
        return (
          <div className="d-flex flex-column gy-6">
            <FormGroup label="Admin API URL">
              <Field
                name="backendAddress"
                component={Fields.Input}
                placeholder="http(s)://host(:port)"
                disabled={submitting || isLoading || isReconnecting}
                parse={(value = '') => parseURL(value, prevValue)}
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
                  <Spinner />
                  <span>Connecting...</span>
                </>
              )}
              {isReconnecting && (
                <>
                  <Spinner />
                  <span>
                    Reconnecting...
                  </span>
                </>
              )}
              {!submitting && !isLoading && !isReconnecting && 'Connect'}
            </Button>
          </div>
        );
      }}
    />
  );
};
