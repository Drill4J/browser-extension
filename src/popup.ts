import * as React from 'react';
import { render } from 'react-dom';
import { Popup } from './components';
import './common/style-guide/common.scss';
import './common/style-guide/fonts/fonts.scss';
import { configureAxios } from './common/connection';

configureAxios();
render(React.createElement(Popup), document.getElementById('root'));
