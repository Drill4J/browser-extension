export interface Agent {
  id?: string;
  name?: string;
  group?: string;
  description?: string;
  status?: boolean;
  drillAdminUrl?: string;
  address?: string;
  ipAddress?: string;
  activePluginsCount?: number;
  pluginsCount?: number;
  buildVersion?: string;
}
