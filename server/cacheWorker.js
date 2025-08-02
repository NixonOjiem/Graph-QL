// cacheWorker.js

require("dotenv").config();
const { pool } = require("./config/database");
const redisClient = require("./lib/redisClient");

async function warmUpCache() {
  console.log("🔥 Starting cache warming...");
  let connection;

  try {
    connection = await pool.getConnection();
    console.log("✅ DB connection acquired");

    // --- Cache countries ---
    const countriesKey = "all-countries";
    console.log("🔍 Fetching countries...");
    const [countries] = await connection.query({
      sql: "SELECT id, name, code, continent, population, gdp, flag_url AS flagUrl, created_at AS createdAt FROM countries",
      timeout: 3000, // 3 seconds time out
    });
    console.log(`✅ Fetched ${countries.length} countries`);

    try {
      // ✅ Simplified caching call. A simple try/catch is cleaner.
      await redisClient.set(countriesKey, JSON.stringify(countries), {
        EX: 5, // Set expiration for 1 hour
      });
      console.log(`✅ Cached countries`);
    } catch (error) {
      // This will now catch the actual Redis error
      console.error(`❌ Country caching failed:`, error);
    }

    // --- Cache cities ---
    const citiesKey = "all-cities";
    console.log("🔍 Fetching cities...");
    const [cities] = await connection.query({
      sql: "SELECT * FROM city",
      timeout: 5000,
    });
    console.log(`✅ Fetched ${cities.length} cities`);

    try {
      // ✅ Simplified caching call
      await redisClient.set(citiesKey, JSON.stringify(cities), {
        EX: 5, // Set expiration for 1 hour
      });
      console.log(`✅ Cached cities`);
    } catch (error) {
      console.error(`❌ City caching failed:`, error);
    }

    console.log("🎉 Cache warming completed!");
  } catch (error) {
    console.error("❌ Cache warming error:", error);
  } finally {
    if (connection) connection.release();
  }
}

async function run() {
  try {
    // ✅ Directly connect to Redis and wait for it to be ready.
    await redisClient.connect();
    console.log("Redis is connected!");

    // Run the cache warmer immediately on start
    await warmUpCache();

    // Run warmUpCache every 10 seconds
    setInterval(warmUpCache, 10 * 1000);
  } catch (err) {
    console.error("❌ Worker failed to start:", err);
    process.exit(1);
  }
}

// Start the worker
run();
