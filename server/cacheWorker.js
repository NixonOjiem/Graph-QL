require("dotenv").config();
const { pool } = require("./config/database");
const redisClient = require("./lib/redisClient");

// Timeout helper function
function promiseTimeout(ms, promise, description) {
  const timeout = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Timeout after ${ms}ms for ${description}`)),
      ms
    );
  });
  return Promise.race([promise, timeout]);
}

async function warmUpCache() {
  console.log("🔥 Starting cache warming...");
  let connection;

  try {
    connection = await pool.getConnection();
    console.log("✅ DB connection acquired");

    // Cache countries
    const countriesKey = "all-countries";
    console.log("🔍 Fetching countries...");
    const [countries] = await connection.query({
      sql: "SELECT id, name, code, continent, population, gdp, flag_url AS flagUrl, created_at AS createdAt FROM countries",
      timeout: 3000, // 3 seconds
    });
    console.log(
      `Countries JSON size: ${Buffer.byteLength(
        JSON.stringify(countries)
      )} bytes`
    );
    console.log(`✅ Fetched ${countries.length} countries`);

    if (countries.length > 0) {
      try {
        await promiseTimeout(
          5000,
          redisClient.set(countriesKey, JSON.stringify(countries), "EX", 3600),
          "Caching countries"
        );
        console.log(`✅ Cached countries`);
      } catch (error) {
        console.error(`❌ Country caching failed: ${error.message}`);
      }
    }

    // Cache cities
    const citiesKey = "all-cities";
    console.log("🔍 Fetching cities...");
    const [cities] = await connection.query({
      sql: "SELECT * FROM city",
      timeout: 5000,
    });
    console.log(
      `Cities JSON size: ${Buffer.byteLength(JSON.stringify(cities))} bytes`
    );
    console.log(`✅ Fetched ${cities.length} cities`);

    if (cities.length > 0) {
      try {
        await promiseTimeout(
          5000,
          redisClient.set(citiesKey, JSON.stringify(cities), "EX", 3600),
          "Caching cities"
        );
        console.log(`✅ Cached cities`);
      } catch (error) {
        console.error(`❌ City caching failed: ${error.message}`);
      }
    }

    console.log("🎉 Cache warming completed!");
  } catch (error) {
    console.error("❌ Cache warming error:", error);
  } finally {
    if (connection) connection.release();
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
