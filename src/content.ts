import { browser } from 'webextension-polyfill-ts';

// browser.storage.local
//   .get(window.location.hostname)
//   .then(({ [window.location.hostname]: { adminUrl = '', agentId = '' } = {} }) => {
//     browser.storage.local.set({ agentId, adminUrl });
//   });

// browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log(tab);
// });
// browser.storage.local.set({ activeTab: window.location.hostname });

// import { render } from 'react-dom';
// import { Content } from 'components/content';
// import 'common/css/global.css';

// const container = document.createElement('div');

// container.id = 'drill4j-widget-container';

// document.getElementsByTagName('body')[0].appendChild(container);

// // render(React.createElement(Content), container);

// import browser from 'webextension-polyfill';

// import { TOKEN_KEY } from './common/constants';

// browser.storage.local.set({
//   token: localStorage.getItem(TOKEN_KEY),
// });
