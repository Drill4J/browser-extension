import { DrillSocket } from './drill-socket';

export const getDefaultAdminSocket = (adminUrl: string, token?: string) => {
  return new DrillSocket(`ws://${adminUrl}/ws/drill-admin-socket?token=${token}`);
};
