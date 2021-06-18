const mongoose = require("mongoose");
const User = require("../Models/user.model");

// search user
module.exports.searchUser = async (req, res, next) => {
  try {
    let query = req.query;
    const results = await User.find(query, { __v: 0 }).select("-password");
    if (!results.length) {
      res.send({ message: "No such user(s)" });
    } else {
      res.send(results);
    }
  } catch (error) {
    next(error);
  }
};



module.exports.searchUsers = async (req, res, next) => {
  try {
    const searchTerm = req.body.search;
    let results = await User.find({ $text: { $search: searchTerm } });
    if (!results.length) {
      res.status(404).send({ message: "No results found! " });
    } else {
      res.status(200).send({ results: results });
    }
  } catch (error) {
    next(error);
  }
};
