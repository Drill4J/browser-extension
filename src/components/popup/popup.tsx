import * as React from 'react';
import { BEM } from '@redneckz/react-bem-helper';
import Parser from 'html-react-parser';
import { browser } from 'webextension-polyfill-ts';
import axios from 'axios';

import { Button } from '../button';
import Logo from './logo-inline.svg';

import styles from './popup.module.scss';

interface Props {
  className?: string;
}

interface State {
  isActive: boolean;
}

const popup = BEM(styles);

export const Popup = popup(
  class extends React.Component<Props, State> {
    public state: Readonly<State> = { isActive: false };

    public async componentDidMount() {
      const { isActive } = await browser.storage.local.get();
      this.setState({ isActive });
    }

    public handleStartRecording = async () => {
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

    public handleStopRecording = () => {
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

    public render() {
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
                ssss
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
