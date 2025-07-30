# --- Builder Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY client/package*.json ./
# COPY client/package.json ./
# COPY client/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your client application code
COPY client/ .

# Build the Next.js application for production
# This command creates the .next directory
RUN npm run build

# --- Runner Stage (for production deployment) ---
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment (already in your docker-compose, but good for clarity)
ENV NODE_ENV production
ENV PORT 3000

# Copy necessary files from the builder stage
# These include your built Next.js app, public assets, and node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public 

# If you have a custom server.js, copy it
# COPY client/server.js ./server.js

# Expose the port (already in docker-compose, but good practice)
EXPOSE 3000

# Command to run the Next.js production server
# Ensure your package.json has a "start" script: "next start"
CMD ["npm", "run", "start"]