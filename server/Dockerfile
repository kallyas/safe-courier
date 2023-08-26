# Use the official Node.js image as the base image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Install Python and build essentials
RUN apk add --no-cache python3 make g++

# Add the Alpine Linux v3.6 main and community repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories

# Update the repository cache
RUN apk update

# Install MongoDB version 3.4.4
RUN apk add mongodb=3.4.4-r0

# Display MongoDB version
RUN mongo --version

# Create a directory for MongoDB data and logs
RUN mkdir -p /data/db /var/log/mongodb
RUN chown 'root' /data/db

# Install OpenRC, which is used to manage system services
RUN apk add --no-cache openrc

# Enable MongoDB to start at boot
RUN rc-update add mongodb default

# Expose the port that your Node.js Express app listens on (e.g., 3000)
EXPOSE 5000

# Start MongoDB and your server
CMD rc-service mongodb start && mongod --fork --logpath /var/log/mongodb/mongod.log && node src/index.js
