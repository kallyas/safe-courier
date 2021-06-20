const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const swaggerUi = require('swagger-ui-express');


const Router = require("./Routes/user.route");
const parcel = require("./Routes/parcel.route")
const search = require("./Routes/search.route");
const middlewares = require("./middlewares");
const RateLimit = require("./helpers/rateLimit");
const swaggerDocument = require('./swagger.json');

app.use(morgan("common"));
app.use(helmet());
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  next();
});

app.use(RateLimit);
app.use("/api/v1/", Router, search, parcel);
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
