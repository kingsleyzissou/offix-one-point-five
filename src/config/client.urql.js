import React from 'react';
import { 
  createClient, 
  Provider, 
  dedupExchange, 
  cacheExchange,
  fetchExchange,
  subscriptionExchange 
} from 'urql';
import { devtoolsExchange } from '@urql/devtools';
import { persistedFetchExchange } from '@urql/exchange-persisted-fetch';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { OffixScheduler } from 'offix-scheduler';
import { pipe, toPromise } from 'wonka';

const subscriptionClient = new SubscriptionClient(
  `ws://localhost:5000/graphql`,
  {
    reconnect: true
  }
);

export const urqlClient = createClient({
  url: 'http://localhost:5000/graphql',
  exchanges: [
    dedupExchange,
    devtoolsExchange,
    cacheExchange,
    persistedFetchExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: operation => {
        return subscriptionClient.request(operation)
      },
    })
  ]
});

class URQLOffline {

  client;

  constructor(client) {
    this.client = client;
  }
  
  async execute(options) {
    const { query, variables } = options;
    const test =  pipe(
      this.client.mutation(query, variables), 
      toPromise
    );
    return test;
  }

}

const scheduler = new OffixScheduler({
  executor: new URQLOffline(urqlClient)
});

export const OfflineContext = React.createContext(null);

function Hydrated({ children }) {
  const [hydrated,setHydrated] = React.useState(false);

  React.useEffect(() => {
    scheduler.init().then(() => setHydrated(true))
  })

  if (hydrated) return children;

  return null;

}

export function URQLProvider({children}) {
  return (
    <Provider value={urqlClient} >
      <OfflineContext.Provider value={scheduler}>
        <Hydrated>
          { children }
        </Hydrated>
      </OfflineContext.Provider>
    </Provider>
  );
}