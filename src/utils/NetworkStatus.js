import { Observable, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

export class NetworkStatus {

  isOnline;
  subscriber;

  constructor() {
    this.subscriber = merge(
      new Observable((o) => o.next(window.navigator.onLine)),
      fromEvent(window, 'online').pipe(map(x => (x.type === 'online'))),
      fromEvent(window, 'offline').pipe(map(x => (x.type === 'online')))
    );
    this.subscribe(x => this.isOnline = x);
  }

  subscribe(observer) {
    this.subscriber.subscribe(observer);
  }

  unsubscribe() {
    // TODO
  }

}