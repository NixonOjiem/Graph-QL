// Import Express
// 1. Load environment variables from .env file (KEEP THIS HERE)
require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Import cors middleware
const { pool, testDbConnection } = require("./config/database"); // Import from database.js

//import Appolo server, JWT, graphql dependencies
const { ApolloServer } = require("apollo-server-express");
const { typeDefs: userTypeDefs } = require("./graphql/schema/user.schema");
const {
  resolvers: userResolvers,
} = require("./graphql/resolvers/user.resolvers");

const { cityResolvers } = require("./graphql/resolvers/city.resolver");
const { cityTypeDefs } = require("./graphql/schema/city.schema");

const { countryTypeDefs } = require("./graphql/schema/coutry.schema");
const { countryResolvers } = require("./graphql/resolvers/country.resolver");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const { mergeResolvers } = require("@graphql-tools/merge");
const typeDefs = mergeTypeDefs([userTypeDefs, countryTypeDefs, cityTypeDefs]);
const resolvers = mergeResolvers([
  userResolvers,
  countryResolvers,
  cityResolvers,
]);

const jwt = require("jsonwebtoken");
const redisClient = require("./lib/redisClient"); // Import the updated client

const hostname = process.env.HOSTNAME || "127.0.0.1";
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res
    .status(200)
    .send('Hello from the Node.js Express server in your "server" folder!\n');
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    let userId = null;
    try {
      if (token) {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        userId = decoded.userId;
      }
    } catch (error) {
      console.error("JWT verification error:", error.message);
    }
    // ✅ Pass the connected redisClient to your resolvers
    return { userId, redisClient };
  },
});

// ❌ The `checkRedisConnection` function is no longer needed.

// Apply Apollo Server middleware to the Express app and Start the server
async function startServers() {
  try {
    // ✅ Directly connect to Redis and wait here.
    await redisClient.connect();
    console.log("Redis client connected!");

    // Start Apollo Server
    await apolloServer.start();

    // Apply Apollo middleware to Express app
    apolloServer.applyMiddleware({ app, path: "/graphql" });

    // Start Express server
    app.listen(port, hostname, () => {
      console.log(`🚀 Express Server running at http://${hostname}:${port}/`);
      console.log(
        `🚀 GraphQL endpoint: http://${hostname}:${port}${apolloServer.graphqlPath}`
      );
      testDbConnection(); // Test DB connection after server starts
    });
  } catch (error) {
    console.error("❌ Failed to start servers:", error);
    process.exit(1);
  }
}

// Start both servers
startServers();
