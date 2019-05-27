import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Input, Button } from '../components';
import { useLocalStorage } from '../hooks';

function useDefaultValue(defaultValue: any) {
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(
    () => {
      setValue(defaultValue);
    },
    [defaultValue],
  );

  return [value, setValue];
}

export const App = () => {
  const { adminUrl: defaultAdminUrl = '', agentId: defaultAgentId = '' } =
    useLocalStorage(['adminUrl', 'agentId']) || {};
  const [adminUrl, setAdminUrl] = useDefaultValue(defaultAdminUrl);
  const [agentId, setAgentId] = useDefaultValue(defaultAgentId);

  return (
    <div style={{ width: ' 300px' }}>
      <Input
        placeholder="Drill Admin URL"
        onChange={({ target: { value } }: any) => setAdminUrl(value)}
        value={adminUrl}
      />
      <Input
        placeholder="Drill Agent ID"
        onChange={({ target: { value } }: any) => setAgentId(value)}
        value={agentId}
      />
      <Button type="secondary" onClick={() => browser.storage.local.set({ adminUrl, agentId })}>
        Save changes
      </Button>
    </div>
  );
};
