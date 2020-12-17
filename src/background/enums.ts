export enum SessionStatus {
  ACTIVE = 'active',
  STOPPED = 'stopped',
  CANCELED = 'canceled',
}

export enum BackendConnectionStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  RECONNECTING = 'reconnecting',
}

export enum AgentType {
  JAVA = 'java',
  JAVA_SCRIPT = 'node.js',
}
