# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY client/package.json ./
COPY client/package-lock.json ./
RUN apk add --no-cache --virtual .build-deps make gcc g++ python 

# install python3
RUN apk add --no-cache --virtual .build-deps python3

# npm config path for python
RUN npm config set python /usr/bin/python3

# npm config set path for node-gyp
RUN npm config set node-gyp /app/node_modules/.bin/node-gyp

RUN npm install --production --silent
RUN npm install react-scripts@3.4.1 -g --silent
RUN apk del .build-deps
COPY client/ . ./
RUN cd client && npm run build

# production environment
FROM nginx:1.21.4-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
