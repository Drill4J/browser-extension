/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import axios from 'axios';
import { Button, Spinner, GeneralAlerts } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';
import { BackendConnectionStatus } from '../../common/enums';
import { useBackendConnectionStatus } from '../../hooks';
import { Fields } from '../fields';
import { composeValidators, required, validateAddress } from '../form-validators';
import { parseURL } from '../../utils';
import * as localStorageUtil from '../../common/util/local-storage';

const validators = composeValidators(
  required('backendAddress', 'Drill4J Admin Address'),
  required('username', 'Username'),
  required('password', 'Password'),
  validateAddress('backendAddress', 'Please enter a valid URL matching the "http(s)://host(:port)" format.'),
);

export const ConnectionForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [initial, setInitial] = React.useState<Record<string, unknown> | null>(null);
  const [signInError, setError] = React.useState("")
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
          setIsLoading(true)
          setError("")
          const { backendAddress, username, password } = data
          try {
            const response = await axios.post(`${backendAddress}/api/sign-in`, {
              username,
              password,
            })
            const token = response.headers.authorization;
            await localStorageUtil.save({ backendAddress, token })
          } catch (e: any) {
            if (e.isAxiosError) {
              if (e.response.status == 401 || e.response.status == 403) {
                setError("Invalid username or password")
              } else {
                console.log('Sign in attempt failed. Reason:',e)
                setError("Unexpected error. Please contact Drill4J instance Adminstrator. To find error log press F12 and open 'Console' tab")
              }
            }
          } finally {
            setIsLoading(false)
          }
      }}
      validate={validators}
      render={({
        handleSubmit, submitting, pristine, invalid, values: { backendAddress = '' } = {},
      }) => {
        const prevValueRef = React.useRef('');

        React.useEffect(() => {
          prevValueRef.current = backendAddress;
        });
        const prevValue = prevValueRef.current;
        return (
          <div className="d-flex flex-column gy-2">
            <label htmlFor="backendAddress">Drill4J Admin Backend Address</label>
            <Field
              label="Admin API URL"
              name="backendAddress"
              component={Fields.Input}
              placeholder="http(s)://host(:port)"
              disabled={submitting || isLoading || isReconnecting}
            />
            <label htmlFor="username">Username</label>
            <Field
              label="Username"
              name="username"
              component={Fields.Input}
              placeholder="Enter username"
              disabled={submitting || isLoading || isReconnecting}
            />
            <label htmlFor="password">Password</label>
            <Field
              label="Password"
              name="password"
              type='password'
              component={Fields.Input}
              placeholder="Enter password"
              disabled={submitting || isLoading || isReconnecting}
            />
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
                  <span>Signing in...</span>
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
              {!submitting && !isLoading && !isReconnecting && 'Sign in'}
            </Button>
            {signInError && <GeneralAlerts type="ERROR">{signInError}</GeneralAlerts>}
          </div>
        );
      }}
    />
  );
};
