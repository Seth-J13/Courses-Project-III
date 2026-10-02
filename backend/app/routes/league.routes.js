import { Router } from "express";
import sectionController from "../controllers/league.controller.js";
import { authenticate, authenticateAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate], sectionController.findAll);
router.post("/", [authenticateAdmin], sectionController.create);
router.put("/:sectionId", [authenticateAdmin], sectionController.update);
router.delete("/:sectionId", [authenticateAdmin], sectionController.remove);

export default router;
