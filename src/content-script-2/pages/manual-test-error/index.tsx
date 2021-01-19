import * as React from 'react';
import { BEM, div } from '@redneckz/react-bem-helper';
import { Icons, useHover } from '@drill4j/ui-kit';

import { copyToClipboard } from '../../../utils/copy-to-clipboard';

import styles from './manual-test-error.module.scss';

interface Props {
  className?: string;
  message?: string;
  messageToCopy?: string;
  children?: React.ReactNode | React.ReactNode[];
}

const manualTestError = BEM(styles);

export const ManualTestError = manualTestError(({
  className, message, messageToCopy = '', children,
}: Props) => {
  const [copiedToClipboard, setCopiedToClipboard] = React.useState(false);
  const { isVisible, ref } = useHover();

  return (
    <div className={`${className} d-flex align-items-center gx-6`}>
      <div className="d-flex align-items-center gx-2">
        <Icons.Warning />
        <div className="d-flex align-items-center gx-1">
          <div className="mr-1 bold">{message}</div>
          <ErrorMessage visible={!isVisible && !copiedToClipboard} title={messageToCopy}>{ messageToCopy }</ErrorMessage>
        </div>
        <div className="position-relative" ref={ref}>
          {!copiedToClipboard && isVisible && <IconTooltip className="position-absolute">Copy error message</IconTooltip>}
          {copiedToClipboard && <IconTooltip className="position-absolute">Copied to clipboard</IconTooltip>}
          <Icon
            onClick={() => {
              copyToClipboard(messageToCopy);
              setCopiedToClipboard(true);
              setTimeout(() => setCopiedToClipboard(false), 5000);
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
const ErrorMessage = manualTestError.errorMessage(div({ visible: true, title: '' } as { visible?: boolean; title: string }));
