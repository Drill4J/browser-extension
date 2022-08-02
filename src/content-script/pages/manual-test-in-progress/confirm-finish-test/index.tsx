import * as React from 'react';
import { Button } from '@drill4j/ui-kit';
import { Form, Field } from 'react-final-form';
import { BEM } from '@redneckz/react-bem-helper';
import { Spinner } from '../../../components';
import * as bgInterop from '../../../../common/background-interop';

import styles from './confirm-finish-test.module.scss';

interface Props {
  className?: string;
  setIsConfirmingFinishTest: React.Dispatch<React.SetStateAction<boolean>>;
}

const confirmFinishTest = BEM(styles);

export const ConfirmFinishTest = confirmFinishTest(({ className, setIsConfirmingFinishTest }: Props) => {
  const [isRequestInProgress, updateRequestStatus] = React.useState(false);
  const isMounted = React.useRef(true);

  React.useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  return (
    <div className={className}>
      <Form
        onSubmit={async (values) => {
          console.log('values', values);
          updateRequestStatus(true);
          await bgInterop.stopTest(values.status);
          if (isMounted.current) updateRequestStatus(false);
        }}
        initialValues={{
          status: 'passed',
        }}
      >
        {({ handleSubmit, form }) => (
          <form onSubmit={handleSubmit} style={{ flexGrow: 1 }} className="d-flex align-items-center gx-6">
            <Message>Finish testing</Message>
            <VerticalLine />
            <label className="bold">Result:</label>
            <label className="d-flex align-items-center">
              <Field name="status" type="radio" value="passed">
                {({ input }) => <input name={input.name} type="radio" value="passed" checked={input.checked} onChange={input.onChange} />}
              </Field>
              Passed
            </label>
            <label className="d-flex align-items-center">
              <Field name="status" type="radio" value="failed">
                {({ input }) => <input name={input.name} type="radio" value="failed" checked={input.checked} onChange={input.onChange} />}
              </Field>
              Failed
            </label>
            <Button size="small" type="primary" disabled={isRequestInProgress}>
              {isRequestInProgress ? (
                <div className="d-flex align-items-center gx-2">
                  <Spinner />
                  <span>Submitting...</span>
                </div>
              ) : (
                <span>Finish</span>
              )}
            </Button>
            <Button disabled={isRequestInProgress} size="small" type="secondary" onClick={() => setIsConfirmingFinishTest(false)}>
              Cancel
            </Button>
          </form>
        )}
      </Form>
    </div>
  );
});

const VerticalLine = confirmFinishTest.verticalLine('div');
const Message = confirmFinishTest.message('div');
