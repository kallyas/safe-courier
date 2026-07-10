import { Router } from "express";
import { checkHealth, deepHealthCheck } from "./health.controller";

const router = Router();

router.get("/health", checkHealth);
router.get("/health/deep", deepHealthCheck);

export default router;
