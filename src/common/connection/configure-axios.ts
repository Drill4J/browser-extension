import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

import { TOKEN_HEADER } from '../constants';

export async function configureAxios() {
  const [{ url = '' }] = await browser.tabs.query({ active: true, currentWindow: true });
  const hostname = new URL(url).hostname;
  const { [hostname]: { adminUrl = '' } = {} } = await browser.storage.local.get(hostname);
  axios.defaults.baseURL = `http://${adminUrl}/api`;

  axios.interceptors.request.use(
    async (config) => {
      const { token } = await browser.storage.local.get();

      if (token) {
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
