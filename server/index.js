const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const fs = require('fs');
const path = require('path');
const resolvers = require('./resolvers');
const { verifyToken } = require('./utils');
require('dotenv').config({ path: __dirname + '/../.env' });

const typeDefs = fs.readFileSync(path.join(__dirname, '../schema/schema.graphql'), 'utf8');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || req.headers['authorization'];
      let user = null;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        try {
          user = verifyToken(token);
        } catch (e) {}
      }
      return { user };
    },
    listen: { port: process.env.PORT || 4000 },
  });
  console.log(`Server ready at ${url}`);
};

startServer().catch((err) => console.error('Server startup error:', err));