import { Router } from "express";
import validate from "../../middlewares/validate.js";
import authValidation from "../../validations/auth.validation.js";
import authController from "../../controllers/auth.controller.js";
import auth from "../../middlewares/auth.js";


const router = Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/admin/login', validate(authValidation.loginAdmin), authController.loginAdmin);

export default router;