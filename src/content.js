import React from 'react';
import { render } from 'react-dom';
import { Widget } from 'components/widget';
import 'common/css/global.css';

const container = document.createElement('div');

container.id = 'drill4j-widget-container';

document.getElementsByTagName('body')[0].appendChild(container);

render(React.createElement(Widget), container);
