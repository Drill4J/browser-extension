interface StompResponse {
  message: string;
  destination: string;
  type: string;
}

export class WsConnection {
  public connection: WebSocket;
  public onMessageListeners: { [key: string]: (arg: unknown) => void };
  constructor(socket: string = 'drill-admin-socket') {
    this.connection = new WebSocket(
      process.env.REACT_APP_ENV
        ? `ws://${window.location.host}/ws/${socket}`
        : `ws://localhost:8090/ws/${socket}`,
    );
    this.onMessageListeners = {};

    this.connection.onmessage = (event) => {
      const { destination, message }: StompResponse = JSON.parse(event.data);
      const callback = this.onMessageListeners[destination];

      callback && callback(JSON.parse(message));
    };
  }

  public onOpen(callback: () => void) {
    this.connection.onopen = callback;

    return this;
  }

  public subscribe(destination: string, callback: (arg: any) => void) {
    this.onMessageListeners[destination] = callback;
    this.send(destination, 'SUBSCRIBE');

    return this;
  }

  public unsubscribe(destination: string) {
    this.send(destination, 'UNSUBSCRIBE');
    delete this.onMessageListeners[destination];

    return this;
  }

  public send(destination: string, type: string, message = '') {
    this.connection.send(
      JSON.stringify({
        destination,
        type,
        message,
      }),
    );

    return this;
  }
}
