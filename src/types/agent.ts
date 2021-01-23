export interface Agent {
  id?: string;
  name?: string;
  group?: string;
  description?: string;
  agentType: string;
  status?: 'ONLINE' | 'OFFLINE' | 'BUSY';
  drillAdminUrl?: string;
  address?: string;
  ipAddress?: string;
  activePluginsCount?: number;
  pluginsCount?: number;
  buildVersion?: string;
}
