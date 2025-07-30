"use client";

import React from "react";
import { gql, useQuery } from "@apollo/client";

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
  return <div>GetCity</div>;
}

export default GetCity;
