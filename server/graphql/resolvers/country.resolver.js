// C:\Users\loveh\server\graphql\resolvers\country.resolver.js

const { pool } = require("../../config/database");

const countryResolvers = {
  Query: {
    countries: async (_, args, { redisClient }) => {
      const redisKey = `all-countries`;
      console.log("Started fetching countries");

      if (redisClient && redisClient.isReady) {
        console.log("Redis client is ready");

        try {
          const redisFetch = redisClient.get(redisKey);

          const cachedCountries = await Promise.race([
            redisFetch,
            new Promise((_, reject) =>
              setTimeout(() => {
                console.warn("Redis get operation timed out");
                reject(new Error("Redis timeout"));
              }, 1500)
            ),
          ]);

          if (cachedCountries) {
            console.log("Countries data from Redis cache.");
            return JSON.parse(cachedCountries);
          } else {
            console.log("Redis returned null or empty");
          }
        } catch (error) {
          console.error("Redis cache error:", error.message);
        }
      } else {
        console.log("Redis client not available or not ready");
      }

      console.log("Fetching countries from database...");
      const [rows] = await pool.query(`
    SELECT 
      id, 
      name, 
      code, 
      continent, 
      population, 
      gdp, 
      flag_url AS flagUrl, 
      created_at AS createdAt
    FROM countries
  `);

      if (redisClient && redisClient.isReady && rows.length > 0) {
        try {
          await redisClient.set(redisKey, JSON.stringify(rows), "EX", 600);
          console.log("Countries cached in Redis");
        } catch (cacheErr) {
          console.error("Failed to cache countries:", cacheErr.message);
        }
      }

      return rows;
    },

    countryByCode: async (_, { code }, { redisClient }) => {
      const redisKey = `country-code:${code}`;

      if (redisClient && redisClient.isReady) {
        try {
          const cachedCountry = await redisClient.get(redisKey);
          if (cachedCountry) {
            console.log(`Country with code ${code} from Redis cache.`);
            return JSON.parse(cachedCountry);
          }
        } catch (err) {
          console.error("Redis cache error:", err.message);
        }
      }

      console.log(`Fetching country with code ${code} from database...`);
      const [rows] = await pool.query(
        `
        SELECT 
          id, 
          name, 
          code, 
          continent, 
          population, 
          gdp, 
          flag_url AS flagUrl, 
          created_at AS createdAt
        FROM countries
        WHERE code = ?
      `,
        [code]
      );

      const country = rows[0] || null;

      if (country && redisClient && redisClient.isReady) {
        try {
          await redisClient.set(redisKey, JSON.stringify(country), "EX", 3600);
          console.log(`Country with code ${code} cached in Redis.`);
        } catch (cacheErr) {
          console.error("Failed to cache country:", cacheErr.message);
        }
      }

      return country;
    },

    countriesByContinent: async (_, { continent }, { redisClient }) => {
      const redisKey = `countries-continent:${continent}`;

      if (redisClient && redisClient.isReady) {
        try {
          const cachedList = await redisClient.get(redisKey);
          if (cachedList) {
            console.log(
              `Countries from continent ${continent} from Redis cache.`
            );
            return JSON.parse(cachedList);
          }
        } catch (err) {
          console.error("Redis cache error:", err.message);
        }
      }

      console.log(
        `Fetching countries from continent ${continent} from database...`
      );
      const [rows] = await pool.query(
        `
        SELECT 
          id, 
          name, 
          code, 
          continent, 
          population, 
          gdp, 
          flag_url AS flagUrl, 
          created_at AS createdAt
        FROM countries
        WHERE continent = ?
      `,
        [continent]
      );

      if (rows.length > 0 && redisClient && redisClient.isReady) {
        try {
          await redisClient.set(redisKey, JSON.stringify(rows), "EX", 1800);
          console.log(`Countries from continent ${continent} cached in Redis.`);
        } catch (cacheErr) {
          console.error(
            "Failed to cache continent countries:",
            cacheErr.message
          );
        }
      }

      return rows;
    },
  },
};

module.exports = { countryResolvers };
