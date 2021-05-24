import * as React from 'react';
import { Button, Checkbox } from '@drill4j/ui-kit';

import { AgentContext } from '../../context';
import * as bgInterop from '../../../common/background-interop';
import { Overlay, Spinner, TextInput } from '../../components';
import { ManualTestError } from '../manual-test-error';

export const StartNewManualTest = () => {
  const [submitError, setSubmitError] = React.useState('');
  const [testName, setTestName] = React.useState('');
  const [isRealtime, setIsRealTime] = React.useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = React.useState(false);
  const agent = React.useContext(AgentContext);

  const isMounted = React.useRef(true);

  React.useEffect(() => () => {
    isMounted.current = false;
  }, []);

  return (
    <div className="d-flex align-items-center gx-4">
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
            <TextInput
              placeholder="Give this test a name"
              value={testName}
              onChange={({ currentTarget: { value } }) => setTestName(value)}
              disabled={isFormSubmitting}
            />
            <span title="Whether a coverage must be updated in real-time or not" style={{ display: 'inherit' }}>
              <span style={{ marginRight: '10px' }}>Realtime</span>
              <Checkbox
                disabled={isFormSubmitting}
                checked={isRealtime}
                onChange={(el) => setIsRealTime(el.target.checked)}
              />
            </span>
            <div title={!testName ? 'Enter a test name to start testing' : undefined}>
              <Button
                type="primary"
                size="small"
                disabled={!testName || isFormSubmitting}
                onClick={async () => {
                  setSubmitError('');
                  setIsFormSubmitting(true);
                  try {
                    await bgInterop.startTest(testName, isRealtime);
                    if (agent.mustRecordJsCoverage) {
                      (window as any).reloadRequired = true;
                    }
                  } catch (e) {
                    setSubmitError(e?.message || 'Something happened on the backend');
                  }
                  if (isMounted.current) setIsFormSubmitting(false);
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
              Go Back
            </Button>
          </ManualTestError>
        </Overlay>
      )}
    </div>
  );
};
