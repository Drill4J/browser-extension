/* eslint-disable react/prop-types */
import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import Parser from 'html-react-parser';
import browser from 'webextension-polyfill';
import axios from 'axios';

import { Button } from '../button';
import Logo from './logo-inline.svg';

import styles from './popup.module.scss';

const popup = BEM(styles);

export const Popup = popup(
  class extends React.Component {
    state = { isActive: false };

    async componentDidMount() {
      const { isActive } = await browser.storage.local.get();
      this.setState({ isActive });
    }

    handleStartRecording = async () => {
      this.setState({ isActive: true });
      axios.patch('/agents/127.0.0.1/action-plugin', {
        sessionId: browser.runtime.id,
        isRecord: true,
      });
      browser.storage.local
        .set({
          isActive: true,
        })
        .then(() => {
          browser.runtime.sendMessage('message');
        });
    };

    handleStopRecording = () => {
      axios.patch('/agents/127.0.0.1/action-plugin', {
        sessionId: browser.runtime.id,
        isRecord: false,
      });
      this.setState({ isActive: false });
      browser.storage.local
        .set({
          isActive: false,
        })
        .then(() => {
          browser.runtime.sendMessage('message');
        });
    };

    render() {
      const { className } = this.props;
      const { isActive } = this.state;
      return (
        <div className={className}>
          <LogoWrapper>{Parser(Logo)}</LogoWrapper>
          <Content>
            {isActive ? (
              <StartButton type="primary" onClick={this.handleStopRecording}>
                Stop
              </StartButton>
            ) : (
              <StartButton type="primary" onClick={this.handleStartRecording}>
                Start
              </StartButton>
            )}
          </Content>
        </div>
      );
    }
  },
);

const LogoWrapper = popup.logoWrapper('div');
const Content = popup.content('div');
const StartButton = popup.startButton(Button);
