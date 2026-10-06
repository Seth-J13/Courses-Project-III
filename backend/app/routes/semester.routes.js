import { Router } from "express";
import semesterController from "../controllers/semester.controller.js";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate], semesterController.findAll);
router.get("/:id", [authenticate], semesterController.findOne);
router.put("/:id", [authenticate], semesterController.update);
router.delete("/:id", [authenticate], semesterController.delete);
router.post("/", [authenticate], semesterController.create);

export default router;
