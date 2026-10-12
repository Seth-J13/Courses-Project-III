import { Router } from "express";
import sectionController from "../controllers/section.controller.js";
import { authenticate, authenticateAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate], sectionController.findAll);
router.post("/", [authenticateAdmin], sectionController.create);
router.get("/:courseId", [authenticate], sectionController.findForCourse);
router.get("/one/:sectionId", [authenticate], sectionController.findOne)
router.put("/:sectionId", [authenticateAdmin], sectionController.update);
router.delete("/:sectionId", [authenticateAdmin], sectionController.remove);

export default router;
