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

//get parcel by id
router.get("/parcels/:parcelId",
auth.authenticateToken,
parcelController.findParcelById
)

// get all parcels for a given user
router.get("/users/:userId/parcels",
auth.authenticateToken,
parcelController.getParcelsByUser)

// cancel the specific parcel delivery order
router.put("/parcels/:parcelId/cancel",
auth.authenticateToken,
parcelController.cancelParcel 
)

//change destination
router.put("/parcels/:parcelId/destination",
auth.authenticateToken,
auth.checkUser, 
parcelController.updateDestination
)

//change the status of the specified parcel
router.put("/parcels/:parcelId/status", 
auth.authenticateToken,
auth.checkUser,
parcelController.updateStatus
)

//change present location of the specific parcel delivery order
router.put("/parcels/:parcelId/presentLocation", 
auth.authenticateToken,
auth.checkUser,
parcelController.updateLocation
)


module.exports = router;

