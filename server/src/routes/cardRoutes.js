import express from "express";
import { createCard, updateCard, deleteCard } from "../controllers/cardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createCard);
router.patch("/:id", updateCard);
router.delete("/:id", deleteCard);

export default router;