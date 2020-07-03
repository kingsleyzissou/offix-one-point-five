import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Store } from './Store';

export class Queue {

  store;
  subject;

  constructor() {
    this.store = new Store();
    this.subject = new BehaviorSubject();
    this.subject.next({ action: 'initialized', payload: null });
  }

  /**
   * Add an entry to the queue
   * 
   * @param key 
   * @param value 
   */
  enqueue(key, value) {
    this.store.add(key, value);
    this.subject.next({ action: 'queued', payload: value });
  }

  /**
   * Attempt to restore queue entries
   * This method iterates through the queue entries
   * and sends them to the forwardOperation method
   * 
   */
  restore() {
    this.store.store.forEach((value, key) => {
      this.forwardOperation(value, key);
    });
  }

  /**
   * This method emits a requeued event to which
   * the scheduler subscribes
   * 
   * @param entry 
   * @param key 
   */
  forwardOperation(entry, key) {
    this.subject.next({ type: 'requeued', payload: { entry, key }});
  }

  /**
   * Remove the entry from the queue
   * 
   * @param key 
   */
  dequeue(key) {
    const op = this.store.get(key);
    this.store.remove(key);
    this.subject.next({ action: 'dequeued', payload: op });
    if (this.store.store.size === 0) this.cleared();
  }

  /**
   * Handle failures from retrying to reexecute
   * the operations
   * 
   * @param err 
   */
  failure(err) {
    console.log(err);
    // TODO implement failure method
    // or possibly add this to the scheduler
  }

  /**
   * Firs off an event for when the queue is cleared
   * 
   */
  cleared() {
    this.subject.next({ action: 'cleared', payload: null });
  }

  /**
   * Subscribe to queue events
   * 
   */
  subscribe() {
    this.subject.subscribe(console.log);
  }

  /**
   * Filter events for queued events
   * 
   */
  queued() {
    this.subject.pipe(
      filter(res => res.type === 'queued')
    ).subscribe(console.log);
  }

  /**
   * Filter events for requeued events only
   * 
   * @param observer 
   */
  onRequeue(observer) {
    this.subject.pipe(
      filter(res => res.type === 'requeued')
    ).subscribe(observer);
  }

}