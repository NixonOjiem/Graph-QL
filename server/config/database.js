// config/database.js
const mysql = require("mysql2/promise");

// 3. Configure MySQL connection pool using environment variables
// Note: dotenv.config() should be called ONCE at the application's entry point (e.g., server.js/index.js)
// to ensure process.env is populated before this file is required.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Use DB_PORT from .env, or default to 3306
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0,
});

// Optional: Test database connection
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to the MySQL database!");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    // You might want to exit the application if a critical DB connection fails
    // process.exit(1); // Consider exiting only in non-dev environments for critical failures
  }
}

// Export the pool and the test function
module.exports = {
  pool,
  testDbConnection,
};
