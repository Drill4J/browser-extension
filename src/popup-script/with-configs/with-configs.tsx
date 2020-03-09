/* eslint-disable indent */
import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';

import { AgentConfig } from 'types/agent-config';
import { configureAxios } from '../../common/connection';

interface InjectedProps {
  configs?: AgentConfig;
}

type ReturnType<T> = React.SFC<Pick<T, Exclude<keyof T, keyof InjectedProps>>>

export const withConfigs = <P extends InjectedProps = InjectedProps>(
  WrappedComponent: React.ComponentType<P>,
): ReturnType<P> => (props: Pick<P, Exclude<keyof P, keyof InjectedProps>>) => {
  const [configs, setConfigs] = React.useState();

  React.useEffect(() => {
    async function setupConnection() {
      const currentConfigs = await getConfigs();
      if (currentConfigs.drillAdminUrl) {
        configureAxios(currentConfigs.drillAdminUrl);
        setConfigs(currentConfigs);
      }
    }

    setupConnection();
  }, []);

  return (
    <WrappedComponent {...props as P} configs={configs} />
  );
};

async function getConfigs() {
  const [{ url = '' }] = await browser.tabs.query({ active: true, currentWindow: true });
  const { host } = new URL(url);
  const { [host]: config } = await browser.storage.local.get(host);

  return config;
}
