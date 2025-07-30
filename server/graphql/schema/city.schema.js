const { gql } = require("apollo-server-express");

const cityTypeDefs = gql`
  type City {
    id: ID!
    name: String!
    country: Country
    population: Int
    area_km2: Float
    created_at: String
  }
`;

module.exports = { cityTypeDefs };
