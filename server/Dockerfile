# Use the official Node.js image as the base image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Install Python and build essentials
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY server/package.json server/package-lock.json ./

# Install dependencies
RUN npm install --production

# Install MongoDB
RUN apk add --no-cache mongodb-tools

# Create a directory for MongoDB data and logs
RUN mkdir -p /data/db /var/log/mongodb

# Expose the port that your Node.js Express app listens on (e.g., 3000)
EXPOSE 5000

# Start MongoDB and your server
CMD mongod --fork --logpath /var/log/mongodb/mongod.log && node src/index.js
