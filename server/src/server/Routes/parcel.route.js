const express = require("express")
const router = express.Router()

const parcelController = require("../Controllers/parcel.controller")
const auth = require("../helpers/auth");

//get all parcels
router.get("/parcels", 
auth.authenticateToken, 
parcelController.getParcels
)

//create a new parcel 
router.post("/parcels", 
auth.authenticateToken, 
parcelController.createParcel
)

//get parcel
router.get("/parcels/:parcelId",
parcelController.findParcelById
)

// get all parcels for a given user
router.get("/users/:userId/parcels",
parcelController.getParcelsByUser)

// cancel the specific parcel delivery order
router.put("/parcels/:parcelId/cancel",
parcelController.cancelParcel 
)

//change destination
router.put("/parcels/:parcelId/destination",
auth.authenticateToken,
auth.checkUser, 
parcelController.updateDestination
)

router.get("/dd", parcelController.destroy)

module.exports = router;

