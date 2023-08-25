# Use the official Node.js image as the base image
FROM node:lts-alpine as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY client/package.json client/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client application files
COPY client/ ./

# Build the React app
RUN npm run build

# Use a lightweight Nginx server as the production server
FROM nginx:1.21.4-alpine

# Copy the built React app to the Nginx server directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
