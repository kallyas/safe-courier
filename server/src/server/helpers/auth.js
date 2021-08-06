const jwt = require("jsonwebtoken");
const User = require("../Models/user.model");

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.status(401).send({
      message: "Unauthorized, Missing Access Token",
    });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err)
      return res
        .status(403)
        .send({ message: "Forbidden, Invalid access Token" });
    next();
  });
};

exports.generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 86400 });
};

exports.checkUser = (req, res, id, next) => {
  if (!id === req.params.id) {
    res.status(403).send({
      message: "you are not allowed to perform this action!",
    });
  }
  next();
};
