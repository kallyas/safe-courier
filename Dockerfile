# build environment
FROM node:lts-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY client/package.json ./
COPY client/package-lock.json ./

RUN apk add --no-cache python3 make g++ && \
    yarn global add node-gyp && \
    yarn cache clean && \
    node-gyp help 
    # mkdir $HOME/.cache && \
    # chown -R node:node $HOME

RUN npm install --production --silent
RUN npm install react-scripts@3.4.1 -g --silent
# RUN apk del .build-deps
COPY client/ . ./
RUN cd client && npm run build

# production environment
# FROM nginx:1.21.4-alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80


FROM httpd:alpine
WORKDIR /var/www/html
COPY --from=build /app/build/ .
EXPOSE 80

