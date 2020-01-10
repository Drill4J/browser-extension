interface StompResponse {
  message: string;
  destination: string;
  type: string;
}

export class WsConnection {
  public connection: WebSocket;
  public onMessageListeners: { [key: string]: (arg: unknown) => void };
  constructor(adminUrl: string, socket: string = 'drill-admin-socket', token?: string) {
    this.connection = new WebSocket(
      adminUrl
        ? `ws://${adminUrl}/ws/${socket}?token=${token}`
        : `ws://localhost:8090/ws/${socket}?token=${token}`,
    );
    this.onMessageListeners = {};

    this.connection.onmessage = (event) => {
      const { destination, message }: StompResponse = JSON.parse(event.data);
      const callback = this.onMessageListeners[destination];

      callback && callback(message ? JSON.parse(message) : null);
    };
  }

  public onOpen(callback: () => void) {
    this.connection.onopen = callback;

    return this;
  }

  public subscribe(destination: string, callback: (arg: any) => void, message?: object) {
    this.onMessageListeners[destination] = callback;
    this.send(destination, 'SUBSCRIBE', message);

    return this;
  }

  public unsubscribe(destination: string) {
    this.send(destination, 'UNSUBSCRIBE');
    delete this.onMessageListeners[destination];

    return this;
  }

  public send(destination: string, type: string, message?: object) {
    if (this.connection.readyState === this.connection.OPEN) {
      this.connection.send(
        JSON.stringify({
          destination,
          type,
          message: JSON.stringify(message),
        }),
      );
    } else {
      setTimeout(() => this.send(destination, type, message), 200);
    }

    return this;
  }
}
