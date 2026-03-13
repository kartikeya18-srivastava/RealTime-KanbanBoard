import express from "express";
import {
  getAllWorkspaces,
  createWorkspace,
  inviteMember,
  deleteWorkspace,
} from "../controllers/workspaceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllWorkspaces);
router.post("/", createWorkspace);
router.post("/:id/invite", inviteMember);
router.delete("/:id", deleteWorkspace);

export default router;