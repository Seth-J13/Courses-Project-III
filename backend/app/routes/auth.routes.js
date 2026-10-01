import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

router.post("/Register", authController.register);
router.post("/Login", authController.login);
router.post("/Logout", [authenticate], authController.logout);

export default router;
