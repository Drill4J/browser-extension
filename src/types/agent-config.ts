import { DomainConfig } from './domain-config';

export interface AgentConfig {
  [key: string]: DomainConfig;
}
