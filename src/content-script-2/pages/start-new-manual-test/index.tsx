import * as React from 'react';
import { Button } from '@drill4j/ui-kit';
import { BEM } from '@redneckz/react-bem-helper';

import { AgentContext } from '../../context';
import * as bgInterop from '../../../common/background-interop';
import { Overlay, Spinner } from '../../components';
import { ManualTestError } from '../manual-test-error';

import styles from './start-new-manual-test.module.scss';

const startNewManualTest = BEM(styles);

interface Props {
  className?: string;
}

export const StartNewManualTest = startNewManualTest(({ className }: Props) => {
  const [submitError, setSubmitError] = React.useState('');
  const [testName, setTestName] = React.useState('');
  const [isFormSubmitting, setIsFormSubmitting] = React.useState(false);
  const agent = React.useContext(AgentContext);

  return (
    <div className={`${className} d-flex align-items-center gx-4 position-relative`}>
      {(window as any).reloadRequired
        ? (
          <>
            <span className="bold">To start new test you have to refresh this page.</span>
            <Button
              className="ml-2"
              onClick={() => window.location.reload()}
              type="primary"
              size="small"
            >
              Refresh
            </Button>
          </>
        ) : (
          <>
            <span>Start new manual test</span>
            <Input
              placeholder={isFormSubmitting ? testName : 'Give this test a name'}
              value={isFormSubmitting ? '' : testName}
              onChange={({ currentTarget: { value } }: React.ChangeEvent<HTMLInputElement>) => setTestName(value)}
            />
            <div title={!testName ? 'Enter a test name to start testing' : undefined}>
              <Button
                type="primary"
                size="small"
                disabled={!testName || isFormSubmitting}
                onClick={async () => {
                  setSubmitError('');
                  setIsFormSubmitting(true);
                  try {
                    await bgInterop.startTest(testName);
                    if (agent.mustRecordJsCoverage) {
                      (window as any).reloadRequired = true;
                    }
                  } catch (e) {
                    setSubmitError(e?.message);
                  }
                  setIsFormSubmitting(false);
                }}
              >
                {isFormSubmitting ? (
                  <div className="d-flex align-items-center gx-2">
                    <Spinner />
                    <span>Starting...</span>
                  </div>
                ) : <span>Start Test</span>}
              </Button>
            </div>
          </>
        )}
      {submitError && (
        <Overlay>
          <ManualTestError messageToCopy={submitError} message="Failed to start test.">
            <Button
              type="primary"
              size="small"
              onClick={() => setSubmitError('')}
            >
              Ok, got it
            </Button>
          </ManualTestError>
        </Overlay>
      )}
    </div>
  );
});

const Input = startNewManualTest.input('input');
