const express = require("express");

const router = express.Router();

const searchController = require("../Controllers/search.controller");

router.get("/users/search", searchController.searchUser);
router.post("/users/search", searchController.searchUsers);

//search for a parcel
router.get("/parcels/search", searchController.searchParcel);

module.exports = router;
