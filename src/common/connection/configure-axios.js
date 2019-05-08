import axios from 'axios';
import browser from 'webextension-polyfill';

import { TOKEN_HEADER } from '../constants';

export async function configureAxios() {
  const { adminUrl } = await browser.storage.local.get('adminUrl');
  axios.defaults.baseURL = `${adminUrl}/api`;

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
        browser.storage.local.set({ token: '' });
        window.location.href = '/login';
      }

      return Promise.reject(error);
    },
  );
}
