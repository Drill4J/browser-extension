import axios from 'axios';
import browser from 'webextension-polyfill';

import { TOKEN_HEADER, TOKEN_KEY } from '../constants';

const hosts = {
  local: 'http://localhost:8090/api',
  development: '/api',
  qa: '',
  prod: '',
};

export function configureAxios() {
  axios.defaults.baseURL = process.env.REACT_APP_ENV
    ? hosts[process.env.REACT_APP_ENV]
    : hosts.local;

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
