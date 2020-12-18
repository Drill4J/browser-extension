import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import { Button, OverflowText, Panel } from '@drill4j/ui-kit';

import * as bgInterop from '../../../../common/background-interop';
import styles from './session-error.module.scss';

import { SessionContext } from '../../../context/session-context';

interface Props {
  className?: string;
}

const sessionError = BEM(styles);

export const SessionError = sessionError(({ className }: Props) => {
  const [isRequestInProgress, updateRequestStatus] = React.useState(false);
  const session = React.useContext(SessionContext);

  return (
    <div className={className}>
      { session && (
        <>
          <Header>
            <OverflowText>{session.testName}</OverflowText>
          </Header>
          <Content>
            <Title>
              Action failed:
            </Title>
            <div>
              { session?.error?.message }
            </div>
            <Panel>
              <Button
                style={{ marginTop: '15px' }}
                type="secondary"
                size="large"
                onClick={async () => {
                  updateRequestStatus(true);
                  try {
                    await bgInterop.cleanupTestSession();
                  } catch (e) {
                    console.log('cleanup recording session failed', e);
                  }
                  updateRequestStatus(false);
                }}
              >
                New manual test
              </Button>
            </Panel>
          </Content>
        </>
      ) }
    </div>
  );
});

const Header = sessionError.header('div');
const Content = sessionError.content('div');
const Title = sessionError.title('div');
