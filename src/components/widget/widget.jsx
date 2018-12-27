import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { pluginsMap } from '../plugins/pluginsMap';
import styles from './widget.css';

export class Widget extends PureComponent {
  static propTypes = {
    sessionId: PropTypes.string,
    sessionHost: PropTypes.string,
  };

  static defaultProps = {
    sessionId: null,
    sessionHost: null,
  };

  state = {
    plugins: [],
  };

  componentDidMount() {
    this.fetchPlugins();
  }

  fetchPlugins() {
    const { sessionHost } = this.props;

    axios
      .get(`${sessionHost}/drill-admin/plugin/getAllPlugins`)
      .then((response) => response.data)
      .then((plugins) => this.setState({ plugins }));
  }

  renderPlugin = (plugin) => {
    const { sessionHost, sessionId } = this.props;
    const PluginComponent = pluginsMap[plugin.id];

    return PluginComponent ? (
      <PluginComponent key={plugin.id} sessionId={sessionId} sessionHost={sessionHost} />
    ) : null;
  };

  render() {
    const { plugins } = this.state;

    return <div className={styles.widget}>{plugins.map(this.renderPlugin)}</div>;
  }
}
