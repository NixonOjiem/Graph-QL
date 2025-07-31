const { gql } = require("apollo-server-express");
const typeDefs = gql`
  type User {
    id: ID!
    fullName: String
    email: String!
    phone: String
    location: String
    provider: String!
    avatarUrl: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input LocalSignupInput {
    fullName: String!
    email: String!
    password: String!
    phone: String
    location: String
  }

  input GoogleSignupInput {
    fullName: String!
    email: String!
    providerId: String!
    avatarUrl: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Mutation {
    localSignup(input: LocalSignupInput!): AuthPayload
    googleSignup(input: GoogleSignupInput!): AuthPayload
    login(input: LoginInput!): AuthPayload
  }

  type Query {
    me: User
  }
`;
module.exports = { typeDefs }; // Export as an object
