// 1. Load environment variables from .env file (KEEP THIS HERE)
require("dotenv").config();

// Import Express
const express = require("express");
const cors = require("cors"); // Import cors middleware
const { pool, testDbConnection } = require("./config/database"); // Import from database.js

//import Appolo server, JWT, graphql dependencies
const { ApolloServer } = require("apollo-server-express");
const { typeDefs } = require("./graphql/schema/user.schema");
const { resolvers } = require("./graphql/resolvers/user.resolvers");
const jwt = require("jsonwebtoken");

// 2. Use process.env to access your server environment variables
const hostname = process.env.HOSTNAME || "127.0.0.1";
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// 3. Initialize Express application
const app = express();

// 4. Add Essential Express Middleware
app.use(cors()); // Enable CORS for all routes (you can configure it more strictly if needed)
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies

// 5. Define a basic Express route
// This replaces your previous http.createServer logic
app.get("/", (req, res) => {
  res
    .status(200)
    .send('Hello from the Node.js Express server in your "server" folder!\n');
});

console.log("TypeDefs:", typeDefs ? "Loaded" : "MISSING");
console.log("Resolvers:", resolvers ? "Loaded" : "MISSING");
// 5. Set up Apollo Server with GraphQL schema and resolvers
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Extract token from Authorization header
    const token = req.headers.authorization || "";

    try {
      // Verify JWT and extract user ID
      if (token) {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        return { userId: decoded.userId };
      }
    } catch (error) {
      console.error("JWT verification error:", error.message);
      // Don't throw error here - let resolvers handle authentication
    }

    // Return context without userId if not authenticated
    return { userId: null };
  },
});

// Apply Apollo Server middleware to the Express app and Start the server
async function startServers() {
  try {
    // Start Apollo Server
    await apolloServer.start();

    // Apply Apollo middleware to Express app
    apolloServer.applyMiddleware({ app, path: "/graphql" });

    // Start Express server
    app.listen(port, hostname, () => {
      console.log(`Express Server running at http://${hostname}:${port}/`);
      console.log(
        `GraphQL endpoint: http://${hostname}:${port}${apolloServer.graphqlPath}`
      );
      console.log(`Database Host: ${process.env.DB_HOST}`);
      console.log(`Database Name: ${process.env.DB_NAME}`);

      // Test database connection
      testDbConnection();
    });
  } catch (error) {
    console.error("Failed to start servers:", error);
    process.exit(1);
  }
}

// Start both servers
startServers();
