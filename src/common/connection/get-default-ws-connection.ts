import { WsConnection } from './ws-connection';

export const getDefaultAdminSocket = (adminUrl: string, token?: string) => {
  return new WsConnection(adminUrl, 'drill-admin-socket', token);
};
