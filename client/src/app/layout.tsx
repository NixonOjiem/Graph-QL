// app/layout.js (or app/layout.tsx)
"use client"; // This component needs to be a client component because it uses ApolloProvider

import React from "react"; // Make sure React is imported for React.ReactNode
import { ApolloProvider } from "@apollo/client";
import "./globals.css"; // Import global styles
import { client } from "../../lib/apollo-client"; // Adjust the path to your apollo-client.js file

// Define the props interface for RootLayout
interface RootLayoutProps {
  children: React.ReactNode; // Explicitly type children as React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {/* Wrap your entire application with ApolloProvider */}
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </body>
    </html>
  );
}
