import * as React from 'react';
import { render } from 'react-dom';
import { App } from './popup-component';
import './common/style-guide/common.scss';
import './common/style-guide/fonts/fonts.scss';
import { configureAxios } from './common/connection';
import './large-logo.png';
import './default-logo.png';

configureAxios().then(() => {
  render(React.createElement(App), document.getElementById('root'));
});
