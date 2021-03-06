import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { FormGroup, Button, Icons } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';

import packageJson from '../../package.json';
import { parseURL } from '../utils';
import {
  Fields,
  composeValidators,
  required,
  validateAddress,
} from '../forms';
import * as localStorageUtil from '../common/util/local-storage';

import '../bootstrap-imports.scss';

import styles from './options-page.module.scss';

interface Props {
  className?: string;
}

interface Domain {
  backendAddress: string;
}

const optionsPage = BEM(styles);

const validators = composeValidators(
  required('backendAddress', 'Admin URL'),
  validateAddress('backendAddress', 'Admin API URL is not correct. Please enter a valid URL matching the "http(s)://host(:port)" format.'),
);

export const App = optionsPage(({ className }: Props) => {
  const [domain, setDomain] = React.useState<Domain | null>(null);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const data = await localStorageUtil.get('backendAddress') as Domain;
      setDomain(data);
    })();
  }, [isSaved]);

  return (
    <div className={`${className} d-flex justify-content-center`}>
      <Content className="d-flex flex-column p-8 mt-7 rounded gy-16">
        <div className="d-flex flex-column border-bottom">
          <span className="fs-24 lh-24">Drill4J Extension Settings</span>
          <span className="fs-14 lh-24 my-2">
            {`Version: ${packageJson.version}`}
          </span>
        </div>
        <Form
          initialValues={domain}
          onSubmit={async (data: Domain) => {
            await localStorageUtil.save(data);
            setIsSaved(true);
          }}
          validate={validators as any}
          render={({
            handleSubmit, submitting, pristine, invalid, values: { backendAddress = '' } = {},
          }) => {
            React.useEffect(() => {
              !pristine && setIsSaved(false);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [backendAddress]);

            const prevValueRef = React.useRef('');
            React.useEffect(() => {
              prevValueRef.current = backendAddress;
            });
            const prevValue = prevValueRef.current;
            return (
              <form className="d-flex flex-column gy-4">
                <FormGroup label="Admin API URL">
                  <Field
                    name="backendAddress"
                    component={Fields.Input}
                    placeholder="http(s)://host(:port)"
                  />
                </FormGroup>
                <div className="d-flex align-items-center gx-4">
                  <SaveButton
                    className="d-flex justify-content-center"
                    type="primary"
                    onClick={handleSubmit}
                    disabled={submitting || pristine || invalid}
                  >
                    {isSaved ? <Icons.Check height={10} width={14} viewBox="0 0 14 10" /> : 'Save'}
                  </SaveButton>
                  {isSaved && (
                    <div className="lh-16">
                      <div className="monochrome-default">Saved.</div>
                      {prevValue && <div className="orange-default">Restart browser to apply changes!</div>}
                    </div>
                  )}
                </div>
              </form>
            );
          }}
        />
      </Content>
    </div>
  );
});

const Content = optionsPage.content('div');
const SaveButton = optionsPage.saveButton(Button);
