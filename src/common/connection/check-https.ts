/* eslint-disable no-console */
import axios from 'axios';

export async function checkHttps(drillAdminUrl: string) {
  const url = new URL(`https://${drillAdminUrl}`);
  url.port = '8443';

  try {
    await axios.get(`https://${url.host}/api/version`);
    axios.defaults.baseURL = `https://${url.host}/api`;
    console.info('Found HTTPS port');
  } catch (error) {
    console.info('HTTPS not found fallback to HTTP');
    axios.defaults.baseURL = `http://${drillAdminUrl}/api`;
  }
}
