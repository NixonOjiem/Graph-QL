const { pool } = require("../../config/database");

const countryResolvers = {
  Query: {
    countries: async () => {
      const [rows] = await pool.query(
        `SELECT 
           id, 
           name, 
           code, 
           continent, 
           population, 
           gdp, 
           flag_url AS flagUrl, 
           created_at AS createdAt
         FROM countries`
      );
      return rows;
    },

    countryByCode: async (_, { code }) => {
      const [rows] = await pool.query(
        `SELECT 
           id, 
           name, 
           code, 
           continent, 
           population, 
           gdp, 
           flag_url AS flagUrl, 
           created_at AS createdAt
         FROM countries
         WHERE code = ?`,
        [code]
      );
      return rows[0] || null;
    },

    countriesByContinent: async (_, { continent }) => {
      const [rows] = await pool.query(
        `SELECT 
           id, 
           name, 
           code, 
           continent, 
           population, 
           gdp, 
           flag_url AS flagUrl, 
           created_at AS createdAt
         FROM countries
         WHERE continent = ?`,
        [continent]
      );
      return rows;
    },
  },
};

module.exports = { countryResolvers };
