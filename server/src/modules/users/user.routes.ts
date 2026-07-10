import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import {
  requirePermission,
  requireSelfOrAdmin,
} from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  changePassword,
  deleteUser,
  findUserById,
  getProfile,
  getUsers,
  updateUser,
} from "./user.controller";
import { changePasswordSchema, updateUserSchema } from "./user.validation";

const router = Router();

router.get("/profile", authenticate, getProfile);
router.get("/users", authenticate, requirePermission("user:list"), getUsers);
router.get("/user/:id", authenticate, findUserById);
router.put(
  "/user/:id",
  authenticate,
  requireSelfOrAdmin,
  validate(updateUserSchema),
  updateUser,
);
router.delete("/user/:id", authenticate, requireSelfOrAdmin, deleteUser);
router.put(
  "/user/:id/password",
  authenticate,
  requireSelfOrAdmin,
  validate(changePasswordSchema),
  changePassword,
);

export default router;
