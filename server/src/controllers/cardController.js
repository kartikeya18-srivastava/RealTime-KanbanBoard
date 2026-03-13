import cardService from "../services/cardService.js";

export const createCard = async (req, res, next) => {
  try {
    const card = await cardService.createCard({ ...req.body, userId: req.user._id });

    const io = req.app.get("io");
    if (io) {
      const populated = await card.populate("assignees", "displayName email avatarColor");
      io.to(`board:${card.boardId}`).emit("card:created", {
        card: populated,
        columnId: card.columnId,
      });
    }

    return res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const { clientVersion, ...patch } = req.body;
    const updated = await cardService.updateCard(req.params.id, patch, clientVersion, req.user._id);

    const io = req.app.get("io");
    if (io) {
      io.to(`board:${updated.boardId}`).emit("card:updated", { card: updated });
    }

    return res.json({ card: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const card = await cardService.deleteCard(req.params.id, req.user._id);

    const io = req.app.get("io");
    if (io) {
      io.to(`board:${card.boardId}`).emit("card:deleted", {
        cardId: card._id,
        columnId: card.columnId,
      });
    }

    return res.json({ message: "Card deleted" });
  } catch (err) {
    next(err);
  }
};