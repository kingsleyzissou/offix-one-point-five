import React from "react";
import { 
  ApolloClient, 
  ApolloProvider, 
  HttpLink, 
  InMemoryCache, 
  split, 
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/link-ws';

import { Scheduler } from '../utils/Scheduler';


const wsLink = new WebSocketLink({
  uri: `ws://localhost:5000/graphql`,
  options: {
    reconnect: true
  }
});

const httpLink = new HttpLink({
  uri: `http://localhost:5000/graphql`
});

const splitLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

const scheduler = new Scheduler(apolloClient);

// subscribe to offline queue events
scheduler.offlineQueue.subscribe();

// for debugging purposes
window.scheduler = scheduler;

export const OfflineContext = React.createContext(null);

export function ApolloClientProvider({ children }) {
  return (
    <ApolloProvider client={apolloClient} >
      <OfflineContext.Provider value={{ scheduler }}>
        {children}
      </OfflineContext.Provider>
    </ApolloProvider>
  );
}