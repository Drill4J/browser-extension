import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { WsConnection } from 'common/connection';
import { GLOBAL, LOCAL } from 'common/constants';

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
        this.setState({
          errors: {
            ...this.state.errors,
            [eventType]: this.state.errors[eventType] + 1,
          },
        });
        break;

      case 'DELETE':
        this.setState({
          errors: {
            ...this.state.errors,
            [eventType]: this.state.errors[eventType] - 1,
          },
        });
        break;

      default:
    }
  }

  render() {
    const { errors } = this.state;
    const { sessionHost, sessionId } = this.props;
    const pluginHref = `${sessionHost}/plugin/1/${sessionId}`;

    return (
      <div>
        Local: {errors[LOCAL]}
        <br />
        Global: {errors[GLOBAL]}
        <br />
        <br />
        <a href={pluginHref} target="_blank">
          Go.
        </a>
      </div>
    );
  }
}
