# server/Dockerfile

# Use a base Node.js image for your server
FROM node:18-alpine

# Set the working directory inside the container for the server
WORKDIR /app/server

# Copy package.json and package-lock.json from the server directory first
# This ensures npm install runs efficiently and is cached
COPY server/package*.json ./

# Install Node.js dependencies for the server
RUN npm install

# Copy the rest of your server application code
COPY server/. .

# If you have a build step for your server (e.g., TypeScript compilation)
# RUN npm run build

# Expose the port your server listens on (e.g., 4000 for GraphQL API)
EXPOSE 3001

# Command to start your server
# Adjust this based on your server's entry point (e.g., app.js, index.js, or a start script)
# Assuming your main server file is in server/src/index.js
CMD ["node", "server/src/index.js"]
# Or if you have a start script in server/package.json:
# CMD ["npm", "start"]