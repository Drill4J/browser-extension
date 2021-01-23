import { AgentStatus } from 'common/enums';
import { SessionActionError } from '../common/errors/session-action-error';

type Handler = (sender: chrome.runtime.MessageSender, ...params: any[]) => unknown;
type Message = { type: string; payload: unknown };
export type MessageReceiver = (sender: chrome.runtime.MessageSender, messsage: Message) => Promise<unknown>;
export type MessageSource = (receiver: MessageReceiver, connectionHandler?: any) => void;

export interface MessageRouter {
  add: (route: string, handler: Handler) => void;
  init: (source: MessageSource) => void;
}

export interface Routes {
  [key: string]: Handler;
}

export interface AgentAdapter {
  startTest: (testName: string, sender?: chrome.runtime.MessageSender) => Promise<string>;
  stopTest: (sessionId: string, sender?: chrome.runtime.MessageSender) => Promise<void>;
  cancelTest: (sessionId: string, sender?: chrome.runtime.MessageSender) => Promise<void>;
}

export type SessionData = {
  testName: string;
  sessionId: string;
  start: number;
  status: SessionStatus;
  end?: number;
  error?: Error | SessionActionError;
}

export type ScopeData = Record<string, any>; // TODO type it properly!

export type SubNotifyFunction = (data: unknown) => void;
export type AdapterType = 'agents' | 'service-groups';

export interface AdapterInfo {
  adapterType: AdapterType;
  id: string;
  host: string;
  status: AgentStatus;
  mustRecordJsCoverage: boolean;
  buildVersion?: string;
}

export interface BackendApi {
  startTest: (testName: string) => Promise<string>;
  stopTest: (sessionId: string) => Promise<void>;
  cancelTest: (sessionId: string) => Promise<void>;
  addSessionData: (sessionId: string, data: unknown) => Promise<void>;
}

export interface BackendCreator {
  getMethods(baseUrl: string): BackendApi;
  subscribeAdmin(route: string, handler: any): () => void;
  subscribeTest2Code(route: string, handler: any, agentId: string, buildVersion?: string | undefined): () => void;
}
