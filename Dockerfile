# Use Node.js 22 (has native WebSocket support for Supabase)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
# We do this before copying the rest of the code to leverage Docker cache
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port (Cloud Run uses the PORT env var, defaults to 8080)
EXPOSE 8080

# Start the application directly with node
CMD ["node", "src/index.js"]
