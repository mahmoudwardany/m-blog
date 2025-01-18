import { Router } from "express";
import { sendResetPassword, getResetPassword, resetPasswordCtrl } from "../controller/auth/password.js";

const router = Router();

// Route to send the reset password link
// POST /api/password/reset-password-link
router.post("/reset-password-link", sendResetPassword);

// Route to handle reset password verification and reset
// GET /api/password/reset-password/:userId/:token
// POST /api/password/reset-password/:userId/:token
router
    .route("/reset-password/:userId/:token")
    .get(getResetPassword)
    .post(resetPasswordCtrl);

export default router;
