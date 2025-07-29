// app/layout.js (or app/layout.tsx)
"use client"; // This component needs to be a client component because it uses ApolloProvider

import React from "react";
import { ApolloProvider } from "@apollo/client";
import "./globals.css"; // Import global styles
import { client } from "../../lib/apollo-client"; // Adjust the path to your apollo-client.js file

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Wrap your entire application with ApolloProvider */}
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </body>
    </html>
  );
}
