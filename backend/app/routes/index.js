import { Router } from "express";
import enrollmentRoutes from "./enrollment.routes.js"

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Register feature routers here as you implement them, e.g.:
// import authRoutes from "./auth.routes.js";
// router.use("/", authRoutes);

router.get("/enrollments", enrollmentRoutes);

export default router;
