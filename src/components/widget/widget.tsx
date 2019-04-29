import * as React from 'react';

export const Widget = () => <div>Widget</div>;
// import axios from 'axios';
// import cookie from 'cookie';
// import Draggable from 'react-draggable';

// import { setStorageItem, getStorageItem } from 'common/utils/localStorage';
// import { pluginsMap } from '../plugins/pluginsMap';
// import { ExceptionsPlugin } from '../plugins/exceptionsPlugin';
// import styles from './widget.css';

// const SESSION_ID_COOKIE_KEY = 'DrillSessionId';
// const SESSION_HOST_COOKIE_KEY = 'DrillSocketHost';
// const WIDGET_POSITION_STORAGE_KEY = 'drill4j-widget-position';
// const cookies = cookie.parse(document.cookie);
// const sessionId = cookies[SESSION_ID_COOKIE_KEY];
// const sessionHost = cookies[SESSION_HOST_COOKIE_KEY];

// export class Widget extends React.PureComponent {
//   public state = {
//     plugins: [],
//   };

//   public componentDidMount() {
//     this.fetchPlugins();
//   }

//   public onDragStop = (event, { x, y }) => setStorageItem(WIDGET_POSITION_STORAGE_KEY, { x, y });

//   public getDefaultWidgetPosition = () => {
//     const resetWidgetPosition = { x: 0, y: 0 };

//     try {
//       return getStorageItem(WIDGET_POSITION_STORAGE_KEY) || resetWidgetPosition;
//     } catch (e) {
//       return resetWidgetPosition;
//     }
//   };

//   public fetchPlugins() {
//     axios
//       .get(`${sessionHost}/drill-admin/plugin/getAllPlugins`)
//       .then((response) => response.data)
//       .then((plugins) => this.setState({ plugins }));
//   }

//   public renderPlugin = (plugin) => {
//     const PluginComponent = pluginsMap[plugin.id];

//     return PluginComponent ? (
//       <PluginComponent sessionId={sessionId} sessionHost={sessionHost} />
//     ) : null;
//   };

//   public render() {
//     const { plugins } = this.state;
//     const defaultPosition = this.getDefaultWidgetPosition();

//     return (
//       <Draggable defaultPosition={defaultPosition} onStop={this.onDragStop}>
//         <div className={styles.widget}>
//           Drill4J
//           {plugins.map((plugin) => (
//             <div key={plugin.id}>{this.renderPlugin(plugin)}</div>
//           ))}
//         </div>
//       </Draggable>
//     );
//   }
// }
