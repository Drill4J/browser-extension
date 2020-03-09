import * as React from 'react';
import { render } from 'react-dom';
import { App } from './popup-script';
import './common/style-guide/_index.scss';
import './common/style-guide/fonts/fonts.scss';
import './large-logo.png';
import './default-logo.png';

render(React.createElement(App), document.getElementById('root'));
