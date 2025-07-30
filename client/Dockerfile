# client/Dockerfile

# --- Builder Stage ---
# Use a base Node.js image for building the Next.js app
FROM node:18-alpine AS builder

# Set the working directory for the client build
WORKDIR /app/client

# Copy package.json and lock file from the client directory
COPY client/package*.json ./

# Install dependencies for the client
RUN npm install

# Copy the rest of the client application code
COPY client/. .

# Build the Next.js application
RUN npm run build

# --- Runner Stage (for production deployment) ---
# Use a lean Node.js image for running the production Next.js app
FROM node:18-alpine AS runner

WORKDIR /app/client

ENV NODE_ENV production

# Next.js requires these directories/files for a production build
COPY --from=builder /app/client/.next/ ./.next/
COPY --from=builder /app/client/node_modules/ ./node_modules/
COPY --from=builder /app/client/package.json ./package.json
COPY --from=builder /app/client/public/ ./public/

# Expose the port Next.js serves on (default 3000)
EXPOSE 3000

# Command to start the Next.js application in production mode
CMD ["npm", "start"]