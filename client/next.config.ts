import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
};

export default nextConfig;
