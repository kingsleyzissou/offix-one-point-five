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
   * @param value 
   */
  enqueue(value) {
    const key = this.ID();
    this.store.add(key, value);
    this.subject.next({ action: 'queued', payload: { key, value } });
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
    const { optimisticResponse, ...options } = entry;
    this.subject.next({ action: 'requeued', payload: { entry: options, key }});
  }

  /**
   * Remove the entry from the queue
   * 
   * @param key 
   */
  dequeue(key, result) {
    const operation = this.store.get(key);
    this.store.remove(key);
    this.subject.next({ action: 'dequeued', payload: { key, operation, result } });
    if (this.store.store.size === 0) this.cleared();
  }

  /**
   * Handle failures from retrying to reexecute
   * the operations
   * 
   * @param err 
   */
  failure(err) {
    // TODO implement failure method
    // or possibly add this to the scheduler
    console.log(err);
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
  queued(observer) {
    this.subject.pipe(
      filter(res => res.action === 'queued')
    ).subscribe(observer);
  }

  /**
   * Filter events for requeued events only
   * 
   * @param observer 
   */
  onRequeue(observer) {
    this.subject.pipe(
      filter(res => res.action === 'requeued')
    ).subscribe(observer);
  }

  onDequeued(observer) {
    this.subject.pipe(
      filter(res => res.action === 'dequeued')
    ).subscribe(observer);
  }

  ID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return "queue:" + Math.random().toString(36).substr(2, 9);
  };

}