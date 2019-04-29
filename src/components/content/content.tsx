import * as React from 'react';

import { Widget } from '../../components/widget';
import { setStorageItem, getStorageItem } from '../../common/utils/localStorage';
import { addMessageListener, removeMessageListener } from '../../common/utils/messages';
import { HIDE_WIDGET } from '../../common/constants/messages';

interface State {
  visible: boolean;
}

const WIDGET_VISIBLE_KEY = 'drill4j-widget-visible';

export class Content extends React.PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      visible: !!this.isVisible(),
    };
  }

  public componentDidMount() {
    addMessageListener(this.messageListener);
  }

  public componentWillUnmount() {
    removeMessageListener(this.messageListener);
  }

  public messageListener = (request: any) => {
    if (request.message === HIDE_WIDGET) {
      this.setContentVisibility();
    }
  };

  public setContentVisibility = () => {
    const visible = !this.state.visible;
    this.setState({ visible });
    setStorageItem(WIDGET_VISIBLE_KEY, visible);
  };

  public isVisible = () => getStorageItem(WIDGET_VISIBLE_KEY);

  public render() {
    return this.state.visible ? <Widget /> : null;
  }
}
