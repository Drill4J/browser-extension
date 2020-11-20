type Handler = (sender: chrome.runtime.MessageSender, ...params: any[]) => unknown;
type Message = { type: string; payload: unknown };
type MessageReceiver = (sender: chrome.runtime.MessageSender, messsage: Message) => Promise<unknown>;
type MessageSource = (receiver: MessageReceiver, connectionHandler?: any) => void;

interface MessageRouter {
  add: (route: string, handler: Handler) => void;
  init: (source: MessageSource) => void;
}

interface Routes {
  [key: string]: Handler;
}
