import * as React from 'react';
import Parser from 'html-react-parser';
import PluginIcon from 'common/img/icon-plugin-inline.svg';
import { WsConnection } from '../../../common/connection';
import { GLOBAL, LOCAL } from '../../../common/constants';
// @ts-ignore
import styles from './exceptionsPlugin.css';

interface Props {
  sessionId?: string;
  sessionHost?: string;
}

interface State {
  errors: { [key: string]: number };
}

export class ExceptionsPlugin extends React.PureComponent<Props, State> {
  public connection: any;
  public state: Readonly<State> = {
    errors: {
      [LOCAL]: 0,
      [GLOBAL]: 0,
    },
  };

  public componentDidMount() {
    const { sessionId } = this.props;

    this.connection = new WsConnection().onOpen(() => {
      this.connection.subscribe('except-ions', (data: any) => this.onMessage(data, GLOBAL));

      if (sessionId) {
        this.connection.subscribe(`except-ions${sessionId}`, (data: any) =>
          this.onMessage(data, LOCAL),
        );
      }
    });
  }

  public onMessage(data: any, eventType: string) {
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

  public render() {
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
