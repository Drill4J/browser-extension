import React, { PureComponent } from 'react';
import axios from 'axios';
import cookie from 'cookie';
import Draggable from 'react-draggable';
import { pluginsMap } from '../plugins/pluginsMap';
import styles from './widget.css';

const SESSION_ID_COOKIE_KEY = 'DrillSessionId';
const SESSION_HOST_COOKIE_KEY = 'DrillSocketHost';
const cookies = cookie.parse(document.cookie);
const sessionId = cookies[SESSION_ID_COOKIE_KEY];
const sessionHost = cookies[SESSION_HOST_COOKIE_KEY];

export class Widget extends PureComponent {
  state = {
    plugins: [],
  };

  componentDidMount() {
    this.fetchPlugins();
  }

  fetchPlugins() {
    axios
      .get(`${sessionHost}/drill-admin/plugin/getAllPlugins`)
      .then((response) => response.data)
      .then((plugins) => this.setState({ plugins }));
  }

  renderPlugin = (plugin) => {
    const PluginComponent = pluginsMap[plugin.id];

    return PluginComponent ? (
      <PluginComponent sessionId={sessionId} sessionHost={sessionHost} />
    ) : null;
  };

  render() {
    const { plugins } = this.state;

    return (
      <Draggable>
        <div className={styles.widget}>
          Drill4J
          {plugins.map((plugin) => (
            <div className={styles.pluginWrapper} key={plugin.id}>
              {this.renderPlugin(plugin)}
            </div>
          ))}
        </div>
      </Draggable>
    );
  }
}
