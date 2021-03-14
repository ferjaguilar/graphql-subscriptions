const { ApolloServer, gql, PubSub } = require('apollo-server');

// The GraphQL schema
const typeDefs = gql`
  type Chat {
    id: Int!
    from: String!
    message: String!
  }

  type Query {
    chats: [Chat]
  }

  type Mutation {
    sendMessage(from: String!, message: String!): Chat
  }

  type Subscription {
    messageSent: Chat
  }
`;

const chats = [];
const CHAT_CHANNEL = 'CHAT_CHANNEL'

const resolvers = {
  Query: {
    chats (root, args, context) {
      return chats
    }
  },
  Mutation: {
    sendMessage (root, { from, message }, { pubsub }) {
      const chat = { id: chats.length + 1, from, message }

      chats.push(chat)
      pubsub.publish('CHAT_CHANNEL', { messageSent: chat });

      return chat
    }
  },
  Subscription: {
    messageSent: {
      subscribe: (root, args, { pubsub }) => {
        return pubsub.asyncIterator(CHAT_CHANNEL)
        }
      }
    }
};

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    pubsub
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});