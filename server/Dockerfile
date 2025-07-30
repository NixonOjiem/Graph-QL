FROM node:18-alpine

# Your application's root directory inside the container
WORKDIR /app/server

# Copy package.json and package-lock.json first
# This allows Docker to cache npm install if package.json doesn't change
COPY server/package*.json ./
# COPY server/package.json ./
# COPY server/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your server application code
# This copies contents of D:\Development\graphql\server to /app/server
COPY server/ .

# Expose the port (optional, but good practice for clarity)
EXPOSE 3001

# Command to run your application
# Assuming your main server file is /app/server/src/index.js
CMD ["node", "index.js"]