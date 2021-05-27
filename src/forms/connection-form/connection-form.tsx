/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import { Button, FormGroup, Spinner } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';
import styled, { keyframes } from 'styled-components';

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
  const [initial, setInitial] = React.useState<Record<string, unknown> | null>(null);
  React.useEffect(() => {
    (async () => {
      const data = await localStorageUtil.get('backendAddress');
      setInitial(data);
    })();
  }, []);
  const { data: backendConnectionStatus, isLoading } = useBackendConnectionStatus();

  const isConnecting = backendConnectionStatus === BackendConnectionStatus.CONNECTING;
  const isUnavailable = backendConnectionStatus === BackendConnectionStatus.UNAVAILABLE;

  return (
    <Form
      initialValues={initial}
      onSubmit={async (data: any) => {
        await localStorageUtil.save(data);
      }}
      validate={validators}
      render={({
        handleSubmit, submitting, pristine, invalid,
      }) => (
        <div className="d-flex flex-column gy-6">
          {isLoading || (isUnavailable && initial?.backendAddress)
            ? (
              <>
                <div className="d-flex flex-column gy-2">
                  <SkeletonTitle />
                  <SkeletonField />
                </div>
                <SkeletonButton className="mr-auto" />
              </>
            )
            : (
              <>
                <FormGroup label="Admin API URL">
                  <Field
                    name="backendAddress"
                    component={Fields.Input}
                    placeholder="http(s)://host(:port)"
                    disabled={submitting || isConnecting}
                  />
                </FormGroup>
                <Button
                  className="mr-auto"
                  type="primary"
                  size="large"
                  disabled={submitting || pristine || invalid || isConnecting}
                  onClick={handleSubmit}
                >
                  {(submitting || isConnecting)
                    ? (
                      <>
                        <Spinner className="mr-2" />
                        <span>Connecting...</span>
                      </>
                    )
                    : 'Connect'}
                </Button>
              </>
            )}
        </div>
      )}
    />
  );
};

const loadingFlash = keyframes`
  0% {
      background-position: -250px;
  }
  100% {
      background-position: calc(100% + 250px);
  }
`;

const Skeleton = styled.div`
  background-color: rgb(240, 240, 240);

  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background: linear-gradient(
      90deg,
      rgb(240, 240, 240) 0px,
      #f9f9f9 calc(50% - 25px),
      #f9f9f9 calc(50% + 25px),
      rgb(240, 240, 240) 100%
    );
    background-size: 35%;
    background-position: 0%;
    background-repeat: no-repeat;
    animation: ${loadingFlash} 1.5s infinite linear;
  }
`;

const SkeletonTitle = styled(Skeleton)`
  height: 20px;
  width: 100px;
`;

const SkeletonField = styled(Skeleton)`
  height: 40px;
  width: 100%;
  border-radius: 4px;
`;

const SkeletonButton = styled(Skeleton)`
  height: 32px;
  width: 150px;
  border-radius: 20px;
`;
