const { gql: countrygql } = require("apollo-server-express");

const countryTypeDefs = countrygql`
  type Country {
    id: ID!
    name: String!
    code: String!
    continent: String!
    population: Int
    gdp: Float
    flagUrl: String
    createdAt: String
  }

  type Query {
    countries: [Country!]!
    countryByCode(code: String!): Country
    countriesByContinent(continent: String!): [Country!]!
  }
`;

module.exports = { countryTypeDefs }; // Export as an object
