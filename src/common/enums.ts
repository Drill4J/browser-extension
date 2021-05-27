export enum SessionStatus {
  ACTIVE = 'active',
  STOPPED = 'stopped',
  CANCELED = 'canceled',
  ERROR = 'error',
}

export enum BackendConnectionStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  RECONNECTING = 'reconnecting',
  CONNECTING = 'connecting',
}

export enum AgentStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
  NOT_REGISTERED = 'NOT_REGISTERED',
}

export enum AgentType {
  JAVA = 'java',
  JAVA_SCRIPT = 'node.js',
}
