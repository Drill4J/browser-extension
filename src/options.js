import * as React from 'react';
import { render } from 'react-dom';
import { App } from './options-component';
import './common/style-guide/common.scss';
import './common/style-guide/fonts/fonts.scss';
import { configureAxios } from './common/connection';

configureAxios();
render(React.createElement(App), document.getElementById('root'));
