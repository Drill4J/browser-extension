import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { FormGroup, Button, Icons } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';

import packageJson from '../../package.json';
import {
  Fields, composeValidators, required, validateBackendAdress,
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

const validateDomain = composeValidators(
  required('backendAddress', 'Admin URL'),
  validateBackendAdress('backendAddress'),
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
          validate={validateDomain as any}
          render={({
            handleSubmit, submitting, pristine, invalid, values: { backendAddress = '' } = {},
          }) => {
            React.useEffect(() => {
              !pristine && setIsSaved(false);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [backendAddress]);
            return (
              <form className="d-flex flex-column gy-4">
                <FormGroup label="Admin API URL">
                  <Field
                    name="backendAddress"
                    component={Fields.Input}
                    placeholder="http(s)://host(:port)"
                    format={(value: string) => {
                      const hostWithHttpProtocol = () => {
                        try {
                          return `http://${new URL(value).host}`;
                        } catch {
                          return value;
                        }
                      };
                      return (/(http(s?)):\/\//i.test(value) ? value : hostWithHttpProtocol());
                    }}
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
                  {isSaved && <div className="lh-16 monochrome-default">Saved.</div>}
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
