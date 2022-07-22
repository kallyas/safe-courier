import express from "express";
import validate from "../../middlewares/validate.js";
import userValidation from "../../validations/user.validation.js";
import auth from "../../middlewares/auth.js";
import { createUser, getUser, getUsers, deleteUser, updateUser } from "../../controllers/user.controller.js";


const router = express.Router();

router.get("/", auth('getUsers'), validate(userValidation.getUsers), getUsers);
router.post("/create", auth('manageUsers'), validate(userValidation.createUser), createUser);
router.route("/:userId")
    .get(auth('manageusers'), validate(userValidation.getUser), getUser)
    .patch(auth('manageUsers'), validate(userValidation.updateUser), updateUser)
    .delete(auth('manageUsers'), validate(userValidation.deleteUser), deleteUser);


export default router;