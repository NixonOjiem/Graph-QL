// C:\Users\loveh\server\redisClient.js
const { createClient } = require("redis");

// The Redis container is accessible on localhost at port 6379
const redisClient = createClient({
  url: "redis://localhost:6379",
});

// Event listeners to handle connection status
redisClient.on("connect", () =>
  console.log("Redis client connected on localhost:6379")
);
redisClient.on("error", (err) => console.log("Redis Client Error", err));

// Connect to Redis and export the client
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
