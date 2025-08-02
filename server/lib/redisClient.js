// lib/redisClient.js

const { createClient } = require("redis");

// ⚙️ Create the client with your desired configuration
const redisClient = createClient({
  url: "redis://localhost:6379",
  socket: {
    // This reconnect strategy is good to keep
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

// ✅ It's still useful to log any errors that might occur
redisClient.on("error", (err) => console.log("Redis Client Error", err));

// ❌ DO NOT connect here.
// ❌ REMOVE the custom isConnected flag and the IIFE.

// ✅ Export the configured, but unconnected, client instance.
module.exports = redisClient;
