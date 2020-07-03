import { from, throwError } from 'rxjs';

import { Queue } from './Queue';
import { NetworkStatus } from './NetworkStatus';

export class Scheduler {
  offlineQueue;
  networkStatus;
  retries = 3; // this could would come from options

  constructor(client) {
    this.client = client;
    this.cache = client.cache;
    this.queryManager = client.queryManager;
    this.queries = client.queryManager.queries;
    this.mutationStore = client.queryManager.mutationStore;
    this.offlineQueue = new Queue();
    this.networkStatus = new NetworkStatus();
    this.networkStatus.subscribe(this.initOnlineState.bind(this));
    this.offlineQueue.onRequeue(this.reexecute.bind(this));
    this.offlineQueue.queued(this.addOR.bind(this));
    this.offlineQueue.onDequeued(this.dequeueObserver.bind(this));
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
    if (!this.networkStatus.isOnline) {
      return this.networkGate(options);
    }
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
    // remove optimistic response before
    // reexecute since optimistic response
    // has already been applied
    const { optimisticResponse, ...opts } = entry;
    const options = { ...opts, retry: entry.retry + 1 };
    this.execute(options).subscribe(
      (result) => {
        // console.log(this.cache);
        this.offlineQueue.dequeue(key, result);
        // const data = this.cache.readQuery({ query: FIND_TODOS });
        // console.log(data);
      }, 
      this.offlineQueue.failure
    );
  }

  /**
   * Extracted network check to a function.
   * Throws a new error if the client is not connected
   * to the network
   * 
   */
  networkGate(options) {
    const { query, variables, retry = 0 } = options;
    this.offlineQueue.enqueue({
      query, variables, retry, ...options
    });
    return throwError('Added to offline queue');
  }

  addOR({ payload }) {
    console.log(payload);
    const { query, variables } = payload.value;
    this.mutationStore.initMutation(
      payload.key,
      query,
      variables
    );

    if (payload.value.optimisticResponse) {
      const { optimisticResponse } = payload.value;
      const optimistic = typeof optimisticResponse === 'function'
        ? optimisticResponse(variables)
        : optimisticResponse;
      
      this.cache.recordOptimisticTransaction(cache => {
        markMutationResult({
          mutationId: payload.key,
          result: { data: optimistic },
          document: query,
          variables: variables,
          update: payload.value.update,
        }, cache);
      }, payload.key);
    }
    this.queryManager.broadcastQueries();
  }

  dequeueObserver({ payload }) {
    console.log(payload);
    const mut = this.mutationStore.get(payload.key);
    console.log(mut);
  }

  retryGate(count) {
    // TODO limit the number of replication
    // retries
    if (count > this.retries) {
      throw new Error('max retries attempted');
    }
  }

}


function markMutationResult(
  mutation,
  cache,
) {
  const cacheWrites = [{
    result: mutation.result.data,
    dataId: 'ROOT_MUTATION',
    query: mutation.document,
    variables: mutation.variables,
  }];

  cache.performTransaction(c => {
    cacheWrites.forEach(write => c.write(write));

    // If the mutation has some writes associated with it then we need to
    // apply those writes to the store by running this reducer again with a
    // write action.
    const { update } = mutation;
    if (update) {
      update(c, mutation.result);
    }
  });
}