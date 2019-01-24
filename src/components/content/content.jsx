import React, { PureComponent } from 'react';

import { Widget } from 'components/widget';
import { setStorageItem, getStorageItem } from 'common/utils/localStorage';
import { addMessageListener, removeMessageListener } from 'common/utils/messages';
import { HIDE_WIDGET } from 'common/constants/messages';

const WIDGET_VISIBLE_KEY = 'drill4j-widget-visible';

export class Content extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: !!this.isVisible()
    };
  }

  componentDidMount() {
    addMessageListener(this.messageListener);
  }

  componentWillUnmount() {
    removeMessageListener(this.messageListener)
  }

  messageListener = (request) => {
    if (request.message === HIDE_WIDGET) this.setContentVisibility()
  };

  setContentVisibility = () => {
    const visible = !this.state.visible;
    this.setState({ visible });
    setStorageItem(WIDGET_VISIBLE_KEY, visible);
  };

  isVisible = () => getStorageItem(WIDGET_VISIBLE_KEY);

  render() {
    return this.state.visible ? <Widget/> : null;
  }
}
