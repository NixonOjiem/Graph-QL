import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flags.example.com',
        port: '',
        pathname: '/**', // Allows all image paths from this hostname
      },
    ],
  },
};

export default nextConfig;
