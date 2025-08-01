const { pool } = require("../../config/database");

const cityResolvers = {
  Query: {
    cities: async (_, args, { redisClient }) => {
      // 1. Define a unique key for the list of cities in Redis
      const redisKey = `all-cities`; // 2. Try to get the list of cities from the Redis cache

      try {
        const cachedCities = await redisClient.get(redisKey);
        if (cachedCities) {
          console.log(`All cities data from Redis cache.`);
          return JSON.parse(cachedCities); // Parse the JSON string back into an array
        }
      } catch (err) {
        console.error("Redis cache error:", err); // Fallback to the database if there's a Redis issue
      } // 3. If no cache hit, fetch the data from the MySQL database

      console.log(`All cities not in cache. Fetching from database...`);
      const [rows] = await pool.query("SELECT * FROM city");
      const cities = rows; // 4. Store the list in the Redis cache with an expiration time

      if (cities && cities.length > 0) {
        // `JSON.stringify` converts the array of objects to a string
        // 'EX' sets an expiration time (e.g., 600 = 10 minutes)
        await redisClient.set(redisKey, JSON.stringify(cities), "EX", 600);
        console.log(`All cities data stored in Redis cache.`);
      } // 5. Return the list of cities

      return cities;
    },

    city: async (_, { id }) => {
      const [rows] = await pool.query("SELECT * FROM city WHERE id = ?", [id]);
      return rows[0] || null;
    },
  },
  City: {
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
