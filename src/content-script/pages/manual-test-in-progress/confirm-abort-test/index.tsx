import * as React from 'react';
import { Button, NegativeActionButton, Spinner } from '@drill4j/ui-kit';
import { BEM } from '@redneckz/react-bem-helper';

import * as bgInterop from '../../../../common/background-interop';

import styles from './confirm-abort-test.module.scss';

interface Props {
  className?: string;
  setIsConfirmingAbort: React.Dispatch<React.SetStateAction<boolean>>;
}

const confirmAbortSession = BEM(styles);

export const ConfirmAbortSession = confirmAbortSession(({ className, setIsConfirmingAbort }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <div className={`${className} d-flex gx-6`}>
      <div className="d-flex align-items-center gx-1">
        <BoldText>Are you sure you want to abort current test?</BoldText>
        <span>All your progress will be lost.</span>
      </div>
      <div className="d-flex gx-4">
        <NegativeActionButton
          size="small"
          className="d-flex align-items-center gx-2"
          onClick={async () => {
            setIsLoading(true);
            await bgInterop.cancelTest();
            setIsLoading(false);
          }}
        >
          {isLoading && <Spinner />}
          Yes, abort
        </NegativeActionButton>
        <Button
          size="small"
          type="secondary"
          onClick={() => setIsConfirmingAbort(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
});

const BoldText = confirmAbortSession.boldText('span');
