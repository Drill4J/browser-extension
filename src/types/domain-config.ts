export interface DomainConfig {
  drillAgentId?: string;
  drillAdminUrl?: string;
  drillGroupId?: string;
  drillAgentType?: 'Java' | 'JS';
  isActive?: boolean;
  testName?: string;
  sessionId?: string;
  timerStart?: number;
  custom?: boolean;
}

export type HostConfig = {
  isWidgetVisible: boolean;
}
