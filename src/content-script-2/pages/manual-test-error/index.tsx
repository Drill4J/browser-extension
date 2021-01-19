import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Icons, useHover } from '@drill4j/ui-kit';

import styles from './manual-test-error.module.scss';
import { copyToClipboard } from '../../../utils';

interface Props {
  message?: string;
  messageToCopy?: string;
  children?: React.ReactNode | React.ReactNode[];
}

const manualTestError = BEM(styles);

export const ManualTestError = manualTestError(({
  message, messageToCopy = '', children,
}: Props) => {
  const [copiedToClipboard, setCopiedToClipboard] = React.useState(false);
  const { isVisible, ref } = useHover();

  React.useEffect(() => {
    const timeout = setTimeout(() => setCopiedToClipboard(false), 5000);
    copiedToClipboard && timeout;
    return () => clearTimeout(timeout);
  }, [copiedToClipboard]);

  return (
    <div className="d-flex align-items-center gx-6 red-default">
      <div className="d-flex align-items-center gx-2">
        <Icons.Warning />
        <div className="d-flex align-items-center gx-1">
          <div className="mr-1 bold">{message}</div>
          <ErrorMessage className="position-relative" title={messageToCopy}>
            { messageToCopy }
            {!copiedToClipboard && isVisible && <IconTooltip className="position-absolute">Copy error message</IconTooltip>}
            {copiedToClipboard && <IconTooltip className="position-absolute">Copied to clipboard</IconTooltip>}
          </ErrorMessage>
        </div>
        <div ref={ref}>
          <Icon
            onClick={async () => {
              copyToClipboard(messageToCopy);
              setCopiedToClipboard(true);
            }}
          >
            {copiedToClipboard ? <Icons.Check width={16} /> : <Icons.Copy width={16} height={16} />}
          </Icon>
        </div>
      </div>
      {children}
    </div>
  );
});

const Icon = manualTestError.icon('div');
const IconTooltip = manualTestError.iconTooltip('div');
const ErrorMessage = manualTestError.errorMessage('div');
