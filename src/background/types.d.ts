import { AgentStatus } from 'common/enums';
import { SessionActionError } from '../common/errors/session-action-error';

type Handler = (sender: chrome.runtime.MessageSender, ...params: any[]) => unknown;
type Message = { type: string; payload: unknown };
export type SessionErrorType = 'abort' | 'finish';
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
  startSession: (isRealtime: boolean, sender?: chrome.runtime.MessageSender) => Promise<string>;
  stopSession: (sessionId: string, testName: string, sender?: chrome.runtime.MessageSender) => Promise<void>;
  cancelSession: (sessionId: string, sender?: chrome.runtime.MessageSender) => Promise<void>;
  addTests: (sessionId: string, tests: TestInfo[]) => Promise<void>;
}

export type SessionData = {
  testId: string;
  testName: string;
  sessionId: string;
  start: number;
  status: SessionStatus;
  end?: number;
  error?: Error | SessionActionError;
  errorType?: SessionErrorType;
};

export type ScopeData = Record<string, any>; // TODO type it properly!

export type SubNotifyFunction = (data: unknown) => void;
export type AdapterType = 'agents' | 'groups';

export interface AdapterInfo {
  adapterType: AdapterType;
  id: string;
  host: string;
  status: AgentStatus;
  mustRecordJsCoverage: boolean;
  buildVersion?: string;
}

export interface BackendApi {
  startSession: (isRealtime: boolean) => Promise<string>;
  stopSession: (sessionId: string) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  addSessionData: (sessionId: string, data: unknown) => Promise<void>;
  addTests(sessionId: string, tests: TestInfo[]): Promise<void>;
}

export interface BackendCreator {
  getMethods(baseUrl: string): BackendApi;
  subscribeAdmin(route: string, handler: any): () => void;
  subscribeTest2Code(route: string, handler: any, agentId: string, buildVersion?: string | undefined): () => void;
}

// TODO extract to @drill4j/types-backend-api?
// (see @drill4j/js-auto-test-agent for more complete typings)
export type TestInfo = {
  id: string;
  result: TestResult;
  startedAt: number;
  finishedAt: number;
  details: TestDetails;
};

export type TestDetails = {
  engine?: string;
  path?: string;
  testName: string;
  params?: Record<string, string>;
  metadata?: Record<string, string>;
};

export const enum TestResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}
