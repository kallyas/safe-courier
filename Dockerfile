FROM node:latest as node

WORKDIR /app/

ENV PATH /app/node_modules/.bin:$PATH

COPY client/package*.json ./

RUN npm install -g npm@7.20.6
RUN npm install
RUN npm install react-scripts@latest -g

COPY client/ . ./

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80
