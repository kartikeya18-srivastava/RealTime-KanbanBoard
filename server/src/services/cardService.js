import Card from "../models/Card.js";
import Column from "../models/Column.js";
import Activity from "../models/Activity.js";

class CardService {
  
  async createCard({ columnId, boardId, title, description, labels, assignees, dueDate, userId }) {
    const column = await Column.findById(columnId);
    if (!column) throw { status: 404, code: "NOT_FOUND", message: "Column not found" };

    const card = new Card({
      columnId,
      boardId,
      title,
      description,
      labels,
      assignees,
      dueDate,
      position: column.cardOrder.length,
      createdBy: userId,
      version: 0,
    });

    await card.save();

    column.cardOrder.push(card._id);
    await column.save();

    await Activity.create({
      boardId,
      actorId: userId,
      action: "card:created",
      payload: { cardId: card._id, title, columnId },
    });

    return card;
  }

  async updateCard(cardId, patch, clientVersion, userId) {
    const card = await Card.findById(cardId);
    if (!card) throw { status: 404, code: "NOT_FOUND", message: "Card not found" };

    if (clientVersion !== undefined && card.version !== clientVersion) {
      throw {
        status: 409,
        code: "VERSION_CONFLICT",
        message: "Card was modified by another user. Please refresh.",
        serverVersion: card.version,
      };
    }

    const allowedFields = ["title", "description", "labels", "assignees", "dueDate"];
    const safePatch = {};
    for (const key of allowedFields) {
      if (patch[key] !== undefined) safePatch[key] = patch[key];
    }
    safePatch.version = card.version + 1;

    const updated = await Card.findByIdAndUpdate(
      cardId,
      { $set: safePatch },
      { returnDocument: "after" }
    ).populate("assignees", "displayName email avatarColor");

    await Activity.create({
      boardId: card.boardId,
      actorId: userId,
      action: "card:updated",
      payload: { cardId, patch: safePatch },
    });

    return updated;
  }

  async moveCard({ cardId, fromColumnId, toColumnId, newPosition, clientVersion, userId }) {
    const card = await Card.findById(cardId);
    if (!card) throw { status: 404, code: "NOT_FOUND", message: "Card not found" };

    if (clientVersion !== undefined && card.version !== clientVersion) {
      throw {
        status: 409,
        code: "VERSION_CONFLICT",
        message: "Card was modified concurrently. Your move was rejected.",
        serverVersion: card.version,
      };
    }

    const sameColumn = fromColumnId === toColumnId;

    if (!sameColumn) {

      await Column.findByIdAndUpdate(fromColumnId, {
        $pull: { cardOrder: card._id },
      });

      const toColumn = await Column.findById(toColumnId);
      if (!toColumn) throw { status: 404, code: "NOT_FOUND", message: "Target column not found" };

      const newOrder = [...toColumn.cardOrder];
      newOrder.splice(newPosition, 0, card._id);
      toColumn.cardOrder = newOrder;
      await toColumn.save();
    } else {

      const column = await Column.findById(fromColumnId);
      if (!column) throw { status: 404, code: "NOT_FOUND", message: "Column not found" };
      const newOrder = column.cardOrder.filter((id) => id.toString() !== cardId);
      newOrder.splice(newPosition, 0, card._id);
      column.cardOrder = newOrder;
      await column.save();
    }

    const updated = await Card.findByIdAndUpdate(
      cardId,
      {
        $set: {
          columnId: toColumnId,
          position: newPosition,
          version: card.version + 1,
        },
      },
      { returnDocument: "after" }
    );

    await Activity.create({
      boardId: card.boardId,
      actorId: userId,
      action: "card:moved",
      payload: { cardId, fromColumnId, toColumnId, newPosition },
    });

    return updated;
  }

  async deleteCard(cardId, userId) {
    const card = await Card.findById(cardId);
    if (!card) throw { status: 404, code: "NOT_FOUND", message: "Card not found" };

    await Card.findByIdAndDelete(cardId);
    await Column.findByIdAndUpdate(card.columnId, { $pull: { cardOrder: card._id } });

    await Activity.create({
      boardId: card.boardId,
      actorId: userId,
      action: "card:deleted",
      payload: { cardId, title: card.title, columnId: card.columnId },
    });

    return card;
  }
}

export default new CardService();