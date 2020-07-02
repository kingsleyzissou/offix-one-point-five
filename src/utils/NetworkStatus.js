import { Observable, fromEvent, merge } from 'rxjs';

export class NetworkStatus {

  isOnline;
  subscriber;

  constructor() {
    this.subscriber = merge(
      new Observable((o) => {
        const state = (window.navigator.onLine) ? 'online' : 'offline';
        o.next({ type: state });
      }),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    );
    this.subscribe(x => {
      this.isOnline = (x.type === 'online');
    });
  }

  subscribe(observer) {
    this.subscriber.subscribe(observer);
  }

  unsubscribe() {
    // TODO
  }

}