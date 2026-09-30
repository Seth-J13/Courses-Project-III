import { Router } from "express";
import courseController from "../controllers/course.controller.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Register feature routers here as you implement them, e.g.:
// import authRoutes from "./auth.routes.js";
// router.use("/", authRoutes);
router.use("/courses", courseController);

export default router;
