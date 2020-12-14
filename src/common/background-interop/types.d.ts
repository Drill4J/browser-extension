export type DisconnectCallback = (reconnectPromise: Promise<any>) => any;
export type ConnectCallback = (connection: BackgroundConnection) => any;
export type BackgroundConnection = {
  subscribe: (resource: string, handler: (...params: any) => any, options?: any) => () => void;
};
