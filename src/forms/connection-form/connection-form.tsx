import * as React from 'react';
import { Button, FormGroup, Spinner } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';

import { BackendConnectionStatus } from '../../common/enums';
import { useBackendConnectionStatus } from '../../hooks';
import { Fields } from '../fields';
import { composeValidators, required } from '../form-validators';
import * as localStorageUtil from '../../common/util/local-storage';

const validateDomain = composeValidators(
  required('backendAddress', 'Admin URL'),
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
        handleSubmit, submitting, pristine, invalid,
      }) => (
        <div className="d-flex flex-column gy-6">
          <FormGroup label="Admin API URL">
            <Field
              name="backendAddress"
              component={Fields.Input}
              placeholder="protocol://hostname:port"
              disabled={submitting || isLoading || isReconnecting}
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
                  {BackendConnectionStatus.RECONNECTING}
                  ...
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
