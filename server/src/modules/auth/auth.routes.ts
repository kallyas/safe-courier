import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { login, logout, signup, verify } from "./auth.controller";
import { loginSchema, signupSchema } from "./auth.validation";

const router = Router();

router.post("/auth/signup", validate(signupSchema), signup);
router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/logout", authenticate, logout);
router.post("/verify", authenticate, verify);

export default router;
