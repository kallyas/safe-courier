FROM node:current-alpine AS build

WORKDIR /app/

COPY client/package*.json ./

RUN npm install --prefer-offline

COPY client/ . .

RUN npm build

FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80
