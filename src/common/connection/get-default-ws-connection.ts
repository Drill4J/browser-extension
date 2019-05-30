import { WsConnection } from './ws-connection';

export const getDefaultAdminSocket = (adminUrl: string) => {
  return new WsConnection(adminUrl);
};
