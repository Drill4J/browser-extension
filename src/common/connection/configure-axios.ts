import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

import { TOKEN_HEADER } from '../constants';

// TODO: temprorary solution should be removed
import { checkHttps } from './check-https';

export async function configureAxios(drillAdminUrl: string) {
  await checkHttps(drillAdminUrl);

  axios.interceptors.request.use(
    async (config) => {
      const { token } = await browser.storage.local.get();

      if (token) {
        // eslint-disable-next-line no-param-reassign
        config.headers[TOKEN_HEADER] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        browser.storage.local.set({ token: '', active: false });
      }

      return Promise.reject(error);
    },
  );
}
