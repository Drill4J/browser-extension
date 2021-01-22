import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';

import { ConnectionForm } from './connection-form';
import { Logo } from '../logo';
import * as localStorageUtil from '../../../common/util/local-storage';

import styles from './connection-page.module.scss';

interface Props {
  className?: string;
}

const connectionPage = BEM(styles);

export const ConnectionPage = connectionPage(({ className }: Props) => {
  const [initial, setInitial] = React.useState<Record<string, unknown> | null>(null);
  React.useEffect(() => {
    (async () => {
      const data = await localStorageUtil.get('backendAddress');
      setInitial(data);
    })();
  }, []);

  return (
    <div className={`${className} h-100`}>
      {initial?.backendAddress ? (
        <div className="d-flex flex-column h-100 justify-content-center align-items-center px-4 gy-6">
          <Logo viewBox="0 0 64 64" width={80} height={80} />
          <div className="d-flex flex-column gy-2 text-center">
            <span>Connection lost</span>
            <Info>
              We’re trying to reconnect. Please wait...
            </Info>
          </div>
        </div>
      ) : <ConnectionForm initial={initial} />}
    </div>
  );
});

const Info = connectionPage.info('div');
