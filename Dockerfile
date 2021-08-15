FROM node:current-alpine AS build

WORKDIR /app/

COPY client/package*.json ./

RUN npm install --prefer-offline

COPY . .

ENV REACT_APP_API_URL={{ secrets.REACT_APP_API_URL }}
ENV REACT_APP_MAPBOX_ACCESS_TOKEN={{ secrets.REACT_APP_MAPBOX_ACCESS_TOKEN }}

RUN npm build

FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80
