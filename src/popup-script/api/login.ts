import axios from 'axios';
import { browser } from 'webextension-polyfill-ts';

import { TOKEN_HEADER } from '../../common/constants';

export async function login() {
  axios.post('/login').then((response) => {
    const authToken = response.headers[TOKEN_HEADER.toLowerCase()];

    if (authToken) {
      browser.storage.local.set({ token: authToken });
    }
  });
}
