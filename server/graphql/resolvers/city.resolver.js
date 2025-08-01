// C:\Users\loveh\server\graphql\resolvers\city.resolver.js

const { pool } = require("../../config/database");

const cityResolvers = {
  Query: {
    // This resolver is correct and uses Redis caching
    cities: async (_, args, { redisClient }) => {
      const redisKey = `all-cities`;
      console.log("Started to fetch cities");

      // 1. Add connection check with timeout
      if (redisClient && redisClient.isReady) {
        console.log("Redis client is ready");
        try {
          // Add timeout for Redis get operation
          const cachedCities = await Promise.race([
            redisClient.get(redisKey),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Redis timeout")), 1500)
            ),
          ]);

          if (cachedCities) {
            console.log(`All cities data from Redis cache.`);
            return JSON.parse(cachedCities);
          }
        } catch (err) {
          console.error("Redis cache error:", err.message);
        }
      } else {
        console.log("Redis client not available or not ready");
      }

      console.log(`Fetching cities from database...`);
      try {
        const [rows] = await pool.query("SELECT * FROM city");
        console.log(`Fetched ${rows.length} cities from database`);

        // 2. Only cache if Redis is ready
        if (redisClient && redisClient.isReady && rows.length > 0) {
          try {
            await redisClient.set(redisKey, JSON.stringify(rows), "EX", 600);
            console.log(`Cities cached in Redis`);
          } catch (setErr) {
            console.error("Failed to cache cities:", setErr.message);
          }
        }
        return rows;
      } catch (dbErr) {
        console.error("Database query failed:", dbErr.message);
        throw new Error("Failed to fetch cities");
      }
    },

    // This resolver is now corrected to use Redis caching
    city: async (_, { id }, { redisClient }) => {
      // <-- CORRECTED: Added { redisClient }
      const redisKey = `city:${id}`;

      try {
        const cachedCity = await redisClient.get(redisKey);
        if (cachedCity) {
          console.log(`City ID ${id} data from Redis cache.`);
          return JSON.parse(cachedCity);
        }
      } catch (err) {
        console.error("Redis cache error:", err);
      }

      console.log(`City ID ${id} not in cache. Fetching from database...`);
      const [rows] = await pool.query("SELECT * FROM city WHERE id = ?", [id]);
      const city = rows[0] || null;

      if (city) {
        await redisClient.set(redisKey, JSON.stringify(city), "EX", 3600);
        console.log(`City ID ${id} data stored in Redis cache.`);
      }
      return city;
    },
  },
  City: {
    // This is a separate resolver for a nested field, so it has its own logic
    country: async (parent) => {
      if (!parent.country_id) {
        return null;
      }
      const [rows] = await pool.query(
        "SELECT id, name, code, continent, population, gdp, flag_url AS flagUrl, created_at AS createdAt FROM countries WHERE id = ?",
        [parent.country_id]
      );
      return rows[0] || null;
    },
  },
};

module.exports = { cityResolvers };
