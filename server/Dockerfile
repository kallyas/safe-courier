# Use the official Node.js image as the base image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Install Python and build essentials
RUN apk add --no-cache python3 make g++

# Install MongoDB and MongoDB tools from Alpine Edge repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/edge/community' >> /etc/apk/repositories
RUN apk update && apk add --no-cache mongodb mongodb-tools

# Create a directory for MongoDB data and logs
RUN mkdir -p /data/db /var/log/mongodb

# Initialize the data directory and set permissions
RUN mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /data/db --smallfiles --port 27017 && \
    sleep 5 && \
    mongo admin --eval "db.createUser({ user: 'admin', pwd: 'password', roles: [ 'root' ] });"

# Install OpenRC, which is used to manage system services
RUN apk add --no-cache openrc

# Enable MongoDB to start at boot
RUN rc-update add mongodb default

# Expose the port that your Node.js Express app listens on (e.g., 3000)
EXPOSE 5000

# Start MongoDB and your server
CMD rc-service mongodb start && node src/index.js
