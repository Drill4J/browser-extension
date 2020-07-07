import axios from 'axios';
import { DrillSocket } from './drill-socket';

// TODO: temprorary solution should be removed
export const getDefaultAdminSocket = (
  adminUrl: string, token?: string,
) => {
  const url = new URL(axios.defaults.baseURL || '');
  return new DrillSocket(`${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/ws/drill-admin-socket?token=${token}`);
};

// TODO: temprorary solution should be removed
export const getDefaultPluginSocket = (
  adminUrl: string, token?: string,
) => {
  const url = new URL(axios.defaults.baseURL || '');

  return new DrillSocket(`${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}/ws/drill-plugin-socket?token=${token}`);
};
