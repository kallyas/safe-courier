# Use the official Node.js Alpine image as the base image
FROM node:alpine

# Set the working directory in the container
WORKDIR /app

# Install Python and build essentials
RUN apk add --no-cache python3 make g++

# Add the MongoDB repository key
RUN wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apk add --no-cache gnupg && gpg --import -

# Add the MongoDB repository to APT sources
RUN echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/5.0 main" > /etc/apk/repositories

# Install MongoDB and MongoDB tools
RUN apk update && apk add --no-cache mongodb-org

# Create a directory for MongoDB data and logs
RUN mkdir -p /data/db /var/log/mongodb

# Initialize the data directory and set permissions
RUN mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /data/db --smallfiles --port 27017 && \
    sleep 5 && \
    mongo admin --eval "db.createUser({ user: 'admin', pwd: 'password', roles: [ 'root' ] });"

# Install OpenRC, which is used to manage system services (Alpine Linux uses OpenRC)
RUN apk add --no-cache openrc

# Enable MongoDB to start at boot
RUN rc-update add mongodb default

# Expose the port that your Node.js Express app listens on (e.g., 3000)
EXPOSE 5000

# Install Node.js packages and your application
COPY server/package.json server/package-lock.json ./
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Start MongoDB and your server
CMD rc-service mongodb start && node src/index.js
