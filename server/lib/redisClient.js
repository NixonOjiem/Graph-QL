const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

// Improved connection handling
let isConnected = false;
redisClient.on("connect", () => {
  console.log("Redis client connected on localhost:6379");
  isConnected = true;
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("end", () => (isConnected = false));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

// Add connection check method
redisClient.isConnected = () => isConnected;

module.exports = redisClient;
