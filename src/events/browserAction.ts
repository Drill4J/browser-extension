import { browser } from 'webextension-polyfill-ts';

import { sendMessageToTab } from '../common/utils/messages';
import { HIDE_WIDGET } from '../common/constants/messages';

export default class BrowserActions {
  constructor() {
    this.init();
  }

  public init() {
    browser.browserAction.onClicked.addListener(() => {
      sendMessageToTab(HIDE_WIDGET);
    });
  }
}
