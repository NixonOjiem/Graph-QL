const { pool } = require("../../config/database");

const cityResolvers = {
  Query: {
    cities: async () => {
      const [rows] = await pool.query("SELECT * FROM city");
      return rows;
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
