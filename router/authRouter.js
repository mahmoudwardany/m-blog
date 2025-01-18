import { Router } from "express";
import { userLogin, verifyAccountCtrl, registerController } from "../controller/auth/auth.js";

const router = Router();

// Route to register a user
// POST /api/auth/register
router.post("/register", registerController);

// Route to log in a user
// POST /api/auth/login
router.post("/login", userLogin);

// Route to verify an account
// GET /api/auth/:userId/verify/:token
router.get("/:userId/verify/:token", verifyAccountCtrl);

export default router;
