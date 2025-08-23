# Backend Dockerfile - build a minimal production image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install deps based on the package.json files
COPY package*.json ./

# Install only production dependencies
ENV NODE_ENV=production
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port (use PORT env var in Railway if you need a different one)
EXPOSE 4000

# Start the application
CMD ["node", "index.js"]
