import User from "../models/User.js";
import Board from "../models/Board.js";
import { verifySocketToken } from "../middleware/authMiddleware.js";
import cardService from "../services/cardService.js";
import boardService from "../services/boardService.js";

const presenceMap = {};

const broadcastPresence = (io, boardId) => {
  if (presenceMap[boardId]) {
    io.to(`board:${boardId}`).emit("presence:update", {
      presence: [...presenceMap[boardId].values()],
    });
  }
};

export default function boardHandlers(io) {
  io.on("connection", (socket) => {
    let currentUser = null;
    let currentBoardId = null;

    const handleError = (err) => {
      console.error(err);
      socket.emit("error", {
        code: err.code || "SERVER_ERROR",
        message: err.message || "Internal server error",
      });
    };

    socket.on("board:join", async ({ token, boardId }) => {
      try {
        const decoded = verifySocketToken(token);
        if (!decoded) throw { code: "UNAUTHORIZED", message: "Invalid token" };

        const user = await User.findById(decoded.userId).select("-passwordHash -refreshTokens");
        if (!user) throw { code: "UNAUTHORIZED", message: "User not found" };

        const state = await boardService.getBoardState(boardId, user._id);
        
        currentUser = user;
        currentBoardId = boardId;
        socket.join(`board:${boardId}`);

        if (!presenceMap[boardId]) presenceMap[boardId] = new Map();
        presenceMap[boardId].set(socket.id, {
          userId: user._id,
          displayName: user.displayName,
          avatarColor: user.avatarColor,
          cardId: null,
        });

        broadcastPresence(io, boardId);
        socket.emit("board:state", state);
      } catch (err) {
        handleError(err);
      }
    });

    socket.on("card:move", async (data) => {
      if (!currentUser || !currentBoardId) return;
      try {
        const updatedCard = await cardService.moveCard({ ...data, userId: currentUser._id });
        
        io.to(`board:${currentBoardId}`).emit("card:moved", {
          ...data,
          newVersion: updatedCard.version,
          movedBy: { userId: currentUser._id, displayName: currentUser.displayName },
        });
      } catch (err) {
        if (err.code === "VERSION_CONFLICT") {
          socket.emit("card:rejected", { cardId: data.cardId, ...err });
        } else {
          handleError(err);
        }
      }
    });

    socket.on("card:update", async ({ cardId, patch, clientVersion }) => {
      if (!currentUser || !currentBoardId) return;
      try {
        const updated = await cardService.updateCard(cardId, patch, clientVersion, currentUser._id);
        io.to(`board:${currentBoardId}`).emit("card:updated", { card: updated });
      } catch (err) {
        if (err.code === "VERSION_CONFLICT") {
          socket.emit("card:rejected", { cardId, ...err });
        } else {
          handleError(err);
        }
      }
    });

    socket.on("card:create", async (data) => {
      if (!currentUser || !currentBoardId) return;
      try {
        const card = await cardService.createCard({ ...data, boardId: currentBoardId, userId: currentUser._id });
        io.to(`board:${currentBoardId}`).emit("card:created", { card, columnId: data.columnId });
      } catch (err) {
        handleError(err);
      }
    });

    socket.on("card:delete", async ({ cardId }) => {
      if (!currentUser || !currentBoardId) return;
      try {
        const card = await cardService.deleteCard(cardId, currentUser._id);
        io.to(`board:${currentBoardId}`).emit("card:deleted", { cardId, columnId: card.columnId });
      } catch (err) {
        handleError(err);
      }
    });

    socket.on("user:typing", ({ cardId }) => {
      if (!currentUser || !currentBoardId || !presenceMap[currentBoardId]) return;
      const userPresence = presenceMap[currentBoardId].get(socket.id);
      if (userPresence) {
        userPresence.cardId = cardId || null;
        socket.to(`board:${currentBoardId}`).emit("presence:update", {
          presence: [...presenceMap[currentBoardId].values()],
        });
      }
    });

    socket.on("disconnect", () => {
      if (currentBoardId && presenceMap[currentBoardId]) {
        presenceMap[currentBoardId].delete(socket.id);
        if (presenceMap[currentBoardId].size === 0) {
          delete presenceMap[currentBoardId];
        } else {
          broadcastPresence(io, currentBoardId);
        }
      }
    });
  });
}