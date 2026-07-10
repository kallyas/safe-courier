import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { requirePermission } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  assignCourier,
  cancelParcel,
  createParcel,
  findParcelById,
  getParcels,
  getParcelsByUser,
  trackParcel,
  updateDestination,
  updateLocation,
  updateStatus,
} from "./parcel.controller";
import {
  assignCourierSchema,
  createParcelSchema,
  updateDestinationSchema,
  updatePresentLocationSchema,
  updateStatusSchema,
} from "./parcel.validation";

const router = Router();

// Public tracking endpoint — declared before "/parcels/:parcelId" so the
// literal segment is not swallowed by the param route.
router.get("/parcels/track/:trackingCode", trackParcel);

router.get("/parcels", authenticate, getParcels);
router.post("/parcels", authenticate, validate(createParcelSchema), createParcel);
router.get("/parcels/:parcelId", authenticate, findParcelById);
router.get("/users/:userId/parcels", authenticate, getParcelsByUser);

router.put("/parcels/:parcelId/cancel", authenticate, cancelParcel);
router.put(
  "/parcels/:parcelId/destination",
  authenticate,
  validate(updateDestinationSchema),
  updateDestination,
);
router.put(
  "/parcels/:parcelId/status",
  authenticate,
  requirePermission("parcel:update:status"),
  validate(updateStatusSchema),
  updateStatus,
);
router.put(
  "/parcels/:parcelId/presentLocation",
  authenticate,
  requirePermission("parcel:update:location"),
  validate(updatePresentLocationSchema),
  updateLocation,
);
router.put(
  "/parcels/:parcelId/assign",
  authenticate,
  requirePermission("parcel:assign"),
  validate(assignCourierSchema),
  assignCourier,
);

export default router;
