import { from } from 'rxjs';

import { Queue } from './Queue';
import { NetworkStatus } from './NetworkStatus';

export class Scheduler {
  offlineQueue;
  networkStatus;
  retries = 3; // this could would come from options

  constructor(client) {
    this.client = client;
    this.offlineQueue = new Queue();
    this.networkStatus = new NetworkStatus();
    this.networkStatus.subscribe(this.initOnlineState.bind(this));
    this.offlineQueue.onRequeue(this.reexecute.bind(this));
  }

  /**
   * This is an observer for the network stuatus observable.
   * Once we subscribe to network status changes, it will
   * check if the client is online, and if so, it will attempt
   * to restore the offline queue.
   * 
   * @param online whether the client is online or not
   */
  initOnlineState(online) {
    if (online) {
      this.offlineQueue.restore();
    }
  }

  /**
   * Scheduler executor method
   * 
   * @param options 
   */
  execute(options) {
    this.networkGate(options);
    const { query, variables } = options;
    return from(this.client.mutate({
      mutation: query,
      variables,
      ...options
    }));
  }

  /**
   * This method is responsible for reexecuting queue
   * entries and treating some of the data before
   * it is sent to the execute method
   * 
   * This is a method that is an observer for the onRequeue
   * observable in the offline queue. When an entry is requeued,
   * it sends the payload to this method
   * 
   * @param  
   */
  reexecute({ payload }) {
    const { entry, key } = payload;
    const options = { ...entry, retry: entry.retry + 1 }
    this.execute(options).subscribe(
      () => this.offlineQueue.dequeue(key), 
      this.offlineQueue.failure
    );
  }

  /**
   * Extracted network check to a function.
   * Throws a new error if the client is not connected
   * to the network
   * 
   */
  networkGate({ query, variables, retry = 0 }) {
    if (!this.networkStatus.isOnline) {
      console.log('some stuff here');
      this.offlineStore.add('id' + Math.random(), {
        query, variables, retry
      });
      throw new Error('Added to offline queue');
    }
  }

  

  

  retryGate(count) {
    if (count > this.retries) {
      throw new Error('max retries attempted');
    }
  }

}