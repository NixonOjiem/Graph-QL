// 1. Load environment variables
require("dotenv").config();

// 2. Import your existing database pool and Redis client
const { pool } = require("./config/database");
const redisClient = require("./lib/redisClient");

// 3. Define the main caching function
async function warmUpCache() {
  console.log("🔥 Starting cache warming process...");

  try {
    console.log("Attempting to get a connection from the pool...");
    const connection = await pool.getConnection();
    console.log("✅ Database connection successful for worker!");
    connection.release(); // Always release the connection back to the pool
  } catch (err) {
    console.error(
      "❌ Worker failed to get a database connection:",
      err.message
    );
    // Stop the function if we can't connect
    return;
  }

  try {
    // --- Cache all countries ---
    const countriesKey = "all-countries";
    console.log("🔍 Fetching all countries from database...");
    const [countries] = await pool.query({
      sql: "SELECT id, name, code, continent, population, gdp, flag_url AS flagUrl, created_at AS createdAt FROM countries",
      timeout: 300, // 3 seconds
    });

    console.log(`✅ Fetched ${countries.length} countries`);

    if (countries.length > 0) {
      console.log(`Setting the countries to the required key`);

      try {
        await Promise.race([
          redisClient.set(countriesKey, JSON.stringify(countries), "EX", 3600), //expire after 1hr
          timeout(5000, "Redis SET countriesKey"), // 5-second timeout for this operation
        ]);

        console.log(
          `✅ Cached ${countries.length} countries under key: ${countriesKey}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to cache countries to Redis: ${error.message}`
        );
        // You can choose to throw the error or just log and continue
      }
    }

    // --- Cache all cities ---
    const citiesKey = "all-cities";
    console.log("🔍 Fetching all cities from database...");
    const [cities] = await pool.query("SELECT * FROM city");

    if (cities.length > 0) {
      await redisClient.set(citiesKey, JSON.stringify(cities), "EX", 3600); // Cache for 1 hour
      console.log(`✅ Cached ${cities.length} cities under key: ${citiesKey}`);
    }

    // You can add more caching logic for other data here...

    console.log("🎉 Cache warming process completed successfully!");
  } catch (error) {
    console.error(
      "❌ An error occurred during the cache warming process:",
      error
    );
  }
}

// 4. Define the main execution loop
async function run() {
  // First, ensure Redis is connected before we do anything
  console.log("Waiting for Redis connection...");
  while (!redisClient.isConnected()) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
  }
  console.log("Redis is connected!");

  // Run the cache warmer immediately on start
  await warmUpCache();

  // Then, run it again every 30 minutes (1800000 milliseconds)
  setInterval(warmUpCache, 1800 * 1000);
}

// 5. Start the worker
run().catch((err) => {
  console.error("❌ Worker failed to start:", err);
  process.exit(1); // Exit if the initial run fails
});
