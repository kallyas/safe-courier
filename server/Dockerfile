FROM node:15

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

ARG NODE_ENV

RUN if [ "$NODE_ENV" == "development" ]; \
    then npm install; \
    else npm install --only=production; \
    fi

# Bundle app source
COPY . ./

ENV PORT 5000

EXPOSE ${PORT}
CMD [ "node", "src/index.js" ]