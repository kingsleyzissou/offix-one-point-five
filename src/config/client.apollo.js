import React from "react";
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split } from '@apollo/client';
import { OffixScheduler } from "offix-scheduler";
import { WebSocketLink } from '@apollo/link-ws';
import { getMainDefinition } from "apollo-utilities";

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

class ApolloOffline {

  client;

  constructor(client) {
    this.client = client;
  }

  async execute(options) {
    const { query, variables } = options;
    return this.client.mutate({
      mutation: query,
      variables,
      ...options
    });
  }

}

const scheduler = new OffixScheduler({
  executor: new ApolloOffline(apolloClient)
});

export const OfflineContext = React.createContext(null);

function Hydrated({ children }) {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    scheduler.init().then(() => setHydrated(true))
  })

  if (hydrated) return children;

  return null;

}

export function ApolloClientProvider({ children }) {
  return (
    <ApolloProvider client={apolloClient} >
      <OfflineContext.Provider value={scheduler}>
        <Hydrated>
          {children}
        </Hydrated>
      </OfflineContext.Provider>
    </ApolloProvider>
  );
}