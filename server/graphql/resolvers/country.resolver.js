// C:\Users\loveh\server\graphql\resolvers\country.resolver.js

const { pool } = require("../../config/database");

/**
 * A helper function to create a timeout promise.
 * @param {number} ms - Timeout in milliseconds.
 * @returns {Promise<never>} A promise that rejects after the timeout.
 */
const redisTimeout = (ms) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Redis operation timed out")), ms)
  );

const countryResolvers = {
  Query: {
    // Corrected to handle caching consistently
    countries: async (_, __, { redisClient }) => {
      const redisKey = `all-countries`;

      if (redisClient && redisClient.isReady) {
        try {
          const cachedCountries = await Promise.race([
            redisClient.get(redisKey),
            redisTimeout(1500),
          ]);
          if (cachedCountries) {
            console.log("✅ All countries data from Redis cache.");
            return JSON.parse(cachedCountries);
          }
        } catch (err) {
          console.error("🚨 Redis cache error (GET):", err.message);
        }
      } else {
        console.log("🟡 Redis client not available for 'countries' query.");
      }

      console.log("🔍 Fetching all countries from database...");
      try {
        const [rows] = await pool.query(
          "SELECT id, name, code, continent, population, gdp, flag_url AS flagUrl, created_at AS createdAt FROM countries"
        );
        if (redisClient && redisClient.isReady && rows.length > 0) {
          try {
            // Set cache with a 10-minute expiry
            await redisClient.set(redisKey, JSON.stringify(rows), "EX", 600);
            console.log("💾 All countries data cached in Redis.");
          } catch (setErr) {
            console.error("🚨 Redis cache error (SET):", setErr.message);
          }
        }
        return rows;
      } catch (dbErr) {
        console.error("🚨 Database query failed:", dbErr.message);
        throw new Error("Failed to fetch countries.");
      }
    },

    // Corrected to handle caching consistently
    countryByCode: async (_, { code }, { redisClient }) => {
      const redisKey = `country-code:${code}`;

      if (redisClient && redisClient.isReady) {
        try {
          const cachedCountry = await Promise.race([
            redisClient.get(redisKey),
            redisTimeout(1500),
          ]);
          if (cachedCountry) {
            console.log(`✅ Country [${code}] data from Redis cache.`);
            return JSON.parse(cachedCountry);
          }
        } catch (err) {
          console.error("🚨 Redis cache error (GET):", err.message);
        }
      } else {
        console.log("🟡 Redis client not available for 'countryByCode' query.");
      }

      console.log(`🔍 Fetching country [${code}] from database...`);
      try {
        const [rows] = await pool.query(
          "SELECT id, name, code, continent, population, gdp, flag_url AS flagUrl, created_at AS createdAt FROM countries WHERE code = ?",
          [code]
        );
        const country = rows[0] || null;

        if (country && redisClient && redisClient.isReady) {
          try {
            // Set cache with a 1-hour expiry
            await redisClient.set(
              redisKey,
              JSON.stringify(country),
              "EX",
              3600
            );
            console.log(`💾 Country [${code}] data cached in Redis.`);
          } catch (setErr) {
            console.error("🚨 Redis cache error (SET):", setErr.message);
          }
        }
        return country;
      } catch (dbErr) {
        console.error("🚨 Database query failed:", dbErr.message);
        throw new Error("Failed to fetch country.");
      }
    },

    // Corrected to handle caching consistently
    countriesByContinent: async (_, { continent }, { redisClient }) => {
      const redisKey = `countries-continent:${continent}`;

      if (redisClient && redisClient.isReady) {
        try {
          const cachedList = await Promise.race([
            redisClient.get(redisKey),
            redisTimeout(1500),
          ]);
          if (cachedList) {
            console.log(
              `✅ Countries from continent [${continent}] from Redis cache.`
            );
            return JSON.parse(cachedList);
          }
        } catch (err) {
          console.error("🚨 Redis cache error (GET):", err.message);
        }
      } else {
        console.log(
          "🟡 Redis client not available for 'countriesByContinent' query."
        );
      }

      console.log(
        `🔍 Fetching countries from continent [${continent}] from database...`
      );
      try {
        const [rows] = await pool.query(
          "SELECT id, name, code, continent, population, gdp, flag_url AS flagUrl, created_at AS createdAt FROM countries WHERE continent = ?",
          [continent]
        );

        if (rows.length > 0 && redisClient && redisClient.isReady) {
          try {
            // Set cache with a 30-minute expiry
            await redisClient.set(redisKey, JSON.stringify(rows), "EX", 1800);
            console.log(
              `💾 Countries from continent [${continent}] cached in Redis.`
            );
          } catch (setErr) {
            console.error("🚨 Redis cache error (SET):", setErr.message);
          }
        }
        return rows;
      } catch (dbErr) {
        console.error("🚨 Database query failed:", dbErr.message);
        throw new Error("Failed to fetch countries by continent.");
      }
    },
  },
};

module.exports = { countryResolvers };
