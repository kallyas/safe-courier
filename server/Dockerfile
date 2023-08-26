# Use the official Debian Buster Slim image as the base image
FROM debian:buster-slim

# Set the working directory in the container
WORKDIR /app

# Install essential packages
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB and MongoDB tools
RUN apt-get update && apt-get install -y mongodb

# Create a directory for MongoDB data and logs
RUN mkdir -p /data/db /var/log/mongodb

# Initialize the data directory and set permissions
RUN mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /data/db --smallfiles --port 27017 && \
    sleep 5 && \
    mongo admin --eval "db.createUser({ user: 'admin', pwd: 'password', roles: [ 'root' ] });"

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Expose the port that your Node.js Express app listens on (e.g., 3000)
EXPOSE 5000

# Install OpenRC, which is used to manage system services (Debian also uses systemd)
RUN apt-get update && apt-get install -y systemd

# Enable MongoDB to start at boot
RUN systemctl enable mongodb

# Start MongoDB and your server
CMD systemctl start mongodb && node src/index.js
