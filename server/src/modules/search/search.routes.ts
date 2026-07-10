import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { advancedSearch, searchParcels, searchUsers } from "./search.controller";
import { advancedSearchSchema } from "./search.validation";

const router = Router();

router.get("/users/search", authenticate, searchUsers);
router.get("/parcels/search", authenticate, searchParcels);
router.post(
  "/search/advanced",
  authenticate,
  validate(advancedSearchSchema),
  advancedSearch,
);

export default router;
