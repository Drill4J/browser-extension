import { DrillSocket } from './drill-socket';

export const getDefaultAdminSocket = (
  adminUrl: string, token?: string,
) => new DrillSocket(`ws://${adminUrl}/ws/drill-admin-socket?token=${token}`);

export const getDefaultPluginSocket = (
  adminUrl: string, token?: string,
) => new DrillSocket(`ws://${adminUrl}/ws/drill-plugin-socket?token=${token}`);
