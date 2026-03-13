import express from "express";
import {
  getBoard,
  getBoards,
  createBoard,
  deleteBoard,
  getBoardActivity,
  createColumn,
  deleteColumn,
  updateColumn,
} from "../controllers/boardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createBoard);
router.get("/", getBoards);
router.get("/:id", getBoard);
router.delete("/:id", deleteBoard);
router.get("/:id/activity", getBoardActivity);
router.post("/:id/columns", createColumn);
router.patch("/:id/columns/:columnId", updateColumn);
router.delete("/:id/columns/:columnId", deleteColumn);

export default router;