import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import PluginIcon from 'common/img/icon-plugin-inline.svg';
import { WsConnection } from 'common/connection';
import { GLOBAL, LOCAL } from 'common/constants';
import styles from './exceptionsPlugin.css';

export class ExceptionsPlugin extends PureComponent {
  static propTypes = {
    sessionId: PropTypes.string,
    sessionHost: PropTypes.string,
  };

  static defaultProps = {
    sessionId: null,
    sessionHost: null,
  };

  state = {
    errors: {
      [LOCAL]: 0,
      [GLOBAL]: 0,
    },
  };

  componentDidMount() {
    const { sessionId } = this.props;

    this.connection = new WsConnection().onOpen(() => {
      this.connection.subscribe('except-ions', (data) => this.onMessage(data, GLOBAL));

      if (sessionId) {
        this.connection.subscribe(`except-ions${sessionId}`, (data) => this.onMessage(data, LOCAL));
      }
    });
  }

  onMessage(data, eventType) {
    switch (data.type) {
      case 'MESSAGE':
        this.setState((state) => ({
          errors: {
            ...state.errors,
            [eventType]: state.errors[eventType] + 1,
          },
        }));
        break;

      case 'DELETE':
        this.setState((state) => ({
          errors: {
            ...state.errors,
            [eventType]: state.errors[eventType] - 1,
          },
        }));
        break;

      default:
    }
  }

  render() {
    const { errors } = this.state;
    const { sessionHost, sessionId } = this.props;
    const pluginHref = `${sessionHost}/plugin/1/${sessionId}`;

    return (
      <div className={styles.exceptionsPlugin}>
        <div className={`${styles.counter} ${styles.local}`}>{errors[LOCAL]}</div>
        <div className={`${styles.counter} ${styles.global}`}>{errors[GLOBAL]}</div>
        <div className={`${styles.counter} ${styles.global}`} style={{ top: 50 }}>
          <a href={pluginHref} target="_blank">
            Go.
          </a>
        </div>
        <i className={styles.icon}>{Parser(PluginIcon)}</i>
      </div>
    );
  }
}
