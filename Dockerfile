# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY client/package.json ./
COPY client/package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY client/ . ./
RUN cd client && npm run build

# production environment
FROM nginx:1.21.3-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
