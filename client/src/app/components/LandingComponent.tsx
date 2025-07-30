"use client";
import React from "react";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";

const GET_COUNTRIES = gql`
  query {
    countries {
      id
      name
      code
      continent
      population
      flagUrl
    }
  }
`;

// Define the interface for a single Country object, matching your GraphQL schema
interface Country {
  id: string; // Assuming 'id' is a string. Adjust if it's a number/ID type in your schema.
  name: string;
  code: string;
  continent?: string | null; // continent can be a string or null
  population?: number | null; // population can be a number or null
  flagUrl?: string | null; // flagUrl can be a string or null
  // Add other fields here if you fetch them in GET_COUNTRIES
}

// Define the interface for the entire data structure returned by the GET_COUNTRIES query
interface CountriesData {
  countries: Country[]; // The 'countries' field returns an array of Country objects
}

function LandingComponent() {
  // Specify the type argument for useQuery to ensure 'data' is correctly typed
  const { data, loading, error } = useQuery<CountriesData>(GET_COUNTRIES);

  if (loading) return <p>Loading countries...</p>; // More descriptive loading message
  if (error) {
    console.error("GraphQL Error:", error); // Log the actual error for debugging
    return <p>Error fetching countries. Please try again later.</p>; // User-friendly error message
  }

  // Add a check for data existence before trying to map over it, and for empty array
  if (!data || !data.countries || data.countries.length === 0) {
    return <p>No countries found.</p>;
  }

  return (
    <div>
      <h2>Countries List</h2> {/* Add a clear heading */}
      <ul>
        {data.countries.map(
          (
            country: Country // Explicitly type 'country' for clarity, though TS would infer it with the useQuery type argument
          ) => (
            <li key={country.id}>
              {/* Conditional rendering for flagUrl to avoid errors if it's null/undefined */}
              {country.flagUrl && (
                <Image
                  src={country.flagUrl}
                  alt={`Flag of ${country.name}`} // More descriptive alt text
                  width={30}
                  height={20} // Adjusted height to be more common for flags
                  style={{ verticalAlign: "middle", marginRight: "8px" }} // Basic styling for better alignment
                />
              )}
              {country.name} ({country.code}) -{" "}
              {/* Conditional rendering and null check for population */}
              {country.population !== undefined && country.population !== null
                ? country.population.toLocaleString()
                : "N/A"}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default LandingComponent;
