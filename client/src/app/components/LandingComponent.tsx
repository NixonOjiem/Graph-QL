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

function LandingComponent() {
  const { data, loading, error } = useQuery(GET_COUNTRIES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching countries</p>;

  return (
    <div>
      <ul>
        {data.countries.map((country) => (
          <li key={country.id}>
            <Image
              src={country.flagUrl}
              alt={country.name}
              width={30}
              height={30}
            />
            {country.name} ({country.code}) -{" "}
            {country.population.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LandingComponent;
