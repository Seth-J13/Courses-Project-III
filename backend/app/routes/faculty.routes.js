import { Router } from "express";
import facultyController from "../controllers/faculty.controller.js";
import { authenticate, authenticateAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticateAdmin], facultyController.findAll);
router.get("/:id", [authenticate], facultyController.findOne);
router.put("/:id", [authenticate], facultyController.update);
router.delete("/:id", [authenticate], facultyController.delete);
router.post("/", [authenticate], facultyController.create);

export default router;
