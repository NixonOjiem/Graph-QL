// index.js (or server.js)

// 1. Load environment variables from .env file (KEEP THIS HERE)
require("dotenv").config();

// Import Express
const express = require("express");
const cors = require("cors"); // Import cors middleware

const { pool, testDbConnection } = require("./config/database"); // Import from database.js

// 2. Use process.env to access your server environment variables
const hostname = process.env.HOSTNAME || "127.0.0.1";
const port = process.env.PORT || 3001;

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

// You'll add more routes, GraphQL endpoint, etc., here later

// 6. Start the Express server
app.listen(port, hostname, () => {
  console.log(`Express Server running at http://${hostname}:${port}/`);
  // Log DB variables here, as they are loaded via dotenv in this file
  console.log(`Database Host: ${process.env.DB_HOST}`);
  console.log(`Database Name: ${process.env.DB_NAME}`);

  // Test the database connection after the server starts listening
  testDbConnection();
});
