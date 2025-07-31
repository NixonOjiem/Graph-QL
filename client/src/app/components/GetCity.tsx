"use client";

import React from "react";
import { gql, useQuery } from "@apollo/client";

interface city {
  id: string;
  name: string;
  population: number;
  country: country | null;
}

interface country {
  name: string;
  continent: string;
}

const GET_CITIES = gql`
  query {
    cities {
      name
      population
      country {
        name
        continent
      }
    }
  }
`;

function GetCity() {
  const { loading, error, data } = useQuery(GET_CITIES);

  if (loading) return <p className="text-red-600">Loading cities...</p>;
  if (error)
    return <p className="text-black">Error fetching cities: {error.message}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-red-600">🌍 City Data</h2>
      <ul className="space-y-4">
        {data.cities.map((city: city, index: number) => (
          <li key={index} className="border border-black p-4 rounded-md">
            <h3 className="text-xl font-semibold text-black">{city.name}</h3>
            <p className="text-sm text-gray-700">
              Population: {city.population?.toLocaleString() || "N/A"}
            </p>
            {city.country ? (
              <div className="mt-2 text-sm text-black">
                <p>
                  Country:{" "}
                  <span className="font-medium">{city.country.name}</span>
                </p>
                <p>
                  Continent:{" "}
                  <span className="font-medium">{city.country.continent}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2 italic">
                Country data not available.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GetCity;
