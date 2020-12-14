import { Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface DrillResponse {
  message: string;
  destination: string;
  type: string;
  to?: {
    agentId: string;
    buildVersion: string;
  };
}

export class DrillSocket {
  public connection$: WebSocketSubject<DrillResponse>;

  public subscription: Subscription;

  private errorCb: (error: null | undefined) => void;

  private completeCb: () => void;

  constructor(url: string, errorCb: any, completeCb: any) {
    this.connection$ = webSocket<DrillResponse>(url);
    this.errorCb = errorCb;
    this.completeCb = completeCb;
    this.subscription = this.connection$.subscribe(
      () => {},
      this.errorCb,
      this.completeCb,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public subscribe(topic: string, callback: (...arg: any) => void, message?: object) {
    console.log('this.errorCb', this.errorCb);
    const subscription = this.connection$.subscribe( // FIXME previous subscription is lost and probably hangs forever
      ({ destination, message: responseMessage, to }: DrillResponse) => destination === topic && callback(responseMessage || null, to),
      this.errorCb,
      this.completeCb,
    );
    this.send(topic, 'SUBSCRIBE', message);

    return () => {
      subscription.unsubscribe();
      this.send(topic, 'UNSUBSCRIBE');
    };
  }

  public cleanup() {
    console.log('cleanup called', this.subscription);
    // FIXME
    // this.subscriptions.forEach(x => x.unsubscribe());
  }

  public reconnect(url: string) {
    this.connection$ = webSocket<DrillResponse>(url);

    this.subscription = this.connection$.subscribe();
  }

  public send(destination: string, type: string, message?: object) {
    console.log();
    this.connection$.next({
      destination,
      type,
      message: JSON.stringify(message),
    });
  }
}
