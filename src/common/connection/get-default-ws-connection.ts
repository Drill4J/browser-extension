import { DrillSocket } from './drill-socket';

// eslint-disable-next-line max-len
export const getDefaultAdminSocket = (adminUrl: string, token?: string) => new DrillSocket(`ws://${adminUrl}/ws/drill-admin-socket?token=${token}`);
