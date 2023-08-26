# Use the official Node.js Alpine image as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Install Python and build essentials
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY server/package.json server/package-lock.json ./

# Install dependencies
RUN npm install --production

# Expose the port that your Node.js Express app listens on (e.g., 5000)
EXPOSE 5000

# Copy the rest of the code from ./server to the working directory /app
COPY server/ ./

# Start your Node.js server
CMD ["node", "$(find src -name 'index.js')"]
