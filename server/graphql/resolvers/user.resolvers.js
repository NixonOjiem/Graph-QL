const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../../config/database"); // Your MySQL connection
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = "1h";

const resolvers = {
  Mutation: {
    localSignup: async (_, { input }) => {
      // Check if user exists
      const [existingUsers] = await pool.execute(
        "SELECT id FROM users WHERE email = ?",
        [input.email]
      );

      if (existingUsers.length > 0) {
        throw new Error("User with this email already exists.");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const [result] = await pool.execute(
        `INSERT INTO users
         (full_name, email, phone, location, password, \`provider\`)
         VALUES (?, ?, ?, ?, ?, 'local')`, // Use backticks for 'provider'
        [
          input.fullName,
          input.email,
          input.phone || null,
          input.location || null,
          hashedPassword,
        ]
      );

      // Get created user (fetch all necessary fields for the User type)
      const [user] = await pool.execute(
        `SELECT
           id,
           full_name,
           email,
           phone,
           location,
           \`provider\`,
           provider_id,
           avatar_url,
           created_at,
           updated_at
         FROM users WHERE id = ?`,
        [result.insertId]
      );

      // Generate JWT
      const token = jwt.sign({ userId: user[0].id }, JWT_SECRET);
      return { token, user: user[0] };
    },

    googleSignup: async (_, { input }) => {
      // Check if user exists
      const [existing] = await pool.query(
        "SELECT id FROM users WHERE provider_id = ?",
        [input.providerId]
      );

      if (existing.length > 0) {
        throw new Error("Google user already exists");
      }

      // Create user
      const [result] = await db.query(
        `INSERT INTO users 
        (full_name, email, provider, provider_id, avatar_url) 
        VALUES (?, ?, 'google', ?, ?)`,
        [input.fullName, input.email, input.providerId, input.avatarUrl || null]
      );

      // Get created user
      const [user] = await pool.query(
        `SELECT 
          id, 
          full_name AS fullName,
          email,
          \`provider\`,
          avatar_url AS avatarUrl,
          created_at AS createdAt
        FROM users WHERE id = ?`,
        [result.insertId]
      );

      // Generate JWT
      const token = jwt.sign({ userId: user[0].id }, JWT_SECRET);
      return { token, user: user[0] };
    },

    login: async (_, { input }) => {
      // Find user by email
      const [users] = await pool.query(
        `SELECT 
          id, 
          password,
          full_name AS fullName,
          email,
          phone,
          location,
          \`provider\`,
          avatar_url AS avatarUrl
        FROM users WHERE email = ?`,
        [input.email]
      );

      if (users.length === 0) {
        throw new Error("Invalid credentials");
      }

      const user = users[0];

      // For Google users without password
      if (user.provider === "google") {
        throw new Error("Please use Google sign-in");
      }

      // Verify password
      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return { token, user };
    },
  },

  Query: {
    me: async (_, __, context) => {
      if (!context.userId) return null;

      const [users] = await pool.query(
        `SELECT 
          id, 
          full_name AS fullName,
          email,
          phone,
          location,
          \`provider\`,
          avatar_url AS avatarUrl,
          created_at AS createdAt
        FROM users WHERE id = ?`,
        [context.userId]
      );

      return users[0] || null;
    },
  },
};
module.exports = { resolvers };
