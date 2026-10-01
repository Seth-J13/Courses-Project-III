import { Router } from "express";
import courseController from "../controllers/course.controller.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import enrollmentRoutes from "./enrollment.routes.js"
import facultyRoutes from "./faculty.routes.js";
const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Register feature routers here as you implement them, e.g.:
// import authRoutes from "./auth.routes.js";
// router.use("/", authRoutes);
router.use("/", authRoutes);
router.use("/courses", courseController);
router.use("/users", userRoutes);
router.get("/enrollments", enrollmentRoutes);
router.use("/faculty", facultyRoutes);

export default router;
