import Router from "express";
import enrollmentController from "../controllers/enrollment.controller.js";
import authenticate from "../authorization/authorization.js";

const router = Router();

router.get("/:universityId", [authenticate], enrollmentController.findAll);
router.post("/:universityId", [authenticate], enrollmentController.create);
router.get("/:universityId/:semesterId", [authenticate], enrollmentController.findBySemester);
router.get("/:universityId/:semesterId/:sectionId", [authenticate], enrollmentController.findOne);
router.delete("/:universityId/:semesterId/:sectionId", [authenticate], enrollmentController.delete);

export default router;
