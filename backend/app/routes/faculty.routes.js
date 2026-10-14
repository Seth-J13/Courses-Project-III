import { Router } from "express";
import facultyController from "../controllers/faculty.controller.js";
import { authenticate, authenticateAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticateAdmin], facultyController.findAll);
router.get("/:facultyId", [authenticate], facultyController.findOne);
router.put("/:facultyId", [authenticate], facultyController.update);
router.delete("/:facultyId", [authenticate], facultyController.delete);
router.post("/", [authenticate], facultyController.create);

export default router;
