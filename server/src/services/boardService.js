import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Card from "../models/Card.js";
import Workspace from "../models/Workspace.js";

class BoardService {
  
  async listBoards(workspaceId, userId) {
    // Check if workspace exists and user is member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw { status: 404, code: "NOT_FOUND", message: "Workspace not found" };

    const member = workspace.members.find(m => m.userId.toString() === userId.toString());
    if (!member) throw { status: 403, code: "FORBIDDEN", message: "Not a member of this workspace" };

    return await Board.find({ workspaceId }).sort("-createdAt");
  }

  async getBoardState(boardId, userId) {
    const board = await Board.findById(boardId).populate("workspaceId");
    if (!board) throw { status: 404, code: "NOT_FOUND", message: "Board not found" };

    const member = board.workspaceId.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!member) throw { status: 403, code: "FORBIDDEN", message: "Access denied" };

    const columns = await Column.find({ boardId: board._id }).sort("position");
    const cards = await Card.find({ boardId: board._id })
      .populate("assignees", "displayName email avatarColor")
      .populate("createdBy", "displayName email avatarColor");

    return {
      board: board.toObject(),
      columns: columns,
      cards: cards,
      role: member.role,
    };
  }

  async createBoard(workspaceId, title, userId) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw { status: 404, code: "NOT_FOUND", message: "Workspace not found" };

    const member = workspace.members.find(m => m.userId.toString() === userId.toString());
    if (!member || member.role === "viewer") {
      throw { status: 403, code: "FORBIDDEN", message: "Insufficient permissions to create boards" };
    }

    const board = new Board({
      workspaceId,
      title,
      createdBy: userId,
      columnOrder: [],
    });
    
    await board.save();
    return board;
  }

  async createColumn(boardId, title, userId) {
    const board = await Board.findById(boardId).populate("workspaceId");
    if (!board) throw { status: 404, code: "NOT_FOUND", message: "Board not found" };

    const member = board.workspaceId.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!member || member.role === "viewer") {
      throw { status: 403, code: "FORBIDDEN", message: "Insufficient permissions" };
    }

    const columnCount = await Column.countDocuments({ boardId });
    const column = new Column({
      boardId,
      title,
      cardOrder: [],
      position: columnCount,
    });

    await column.save();
    board.columnOrder.push(column._id);
    await board.save();

    return column;
  }

  async updateColumn(boardId, columnId, title, userId) {
    const board = await Board.findById(boardId).populate("workspaceId");
    if (!board) throw { status: 404, code: "NOT_FOUND", message: "Board not found" };

    const member = board.workspaceId.members.find(m => m.userId.toString() === userId.toString());
    if (!member || member.role === "viewer") {
      throw { status: 403, code: "FORBIDDEN", message: "Insufficient permissions" };
    }

    const column = await Column.findOneAndUpdate(
      { _id: columnId, boardId },
      { title },
      { new: true }
    );

    if (!column) throw { status: 404, code: "NOT_FOUND", message: "Column not found" };

    return column;
  }

  async deleteColumn(boardId, columnId, userId) {
    const board = await Board.findById(boardId).populate("workspaceId");
    if (!board) throw { status: 404, code: "NOT_FOUND", message: "Board not found" };

    const member = board.workspaceId.members.find(m => m.userId.toString() === userId.toString());
    if (!member || member.role === "viewer") {
      throw { status: 403, code: "FORBIDDEN", message: "Insufficient permissions" };
    }

    const column = await Column.findOne({ _id: columnId, boardId });
    if (!column) throw { status: 404, code: "NOT_FOUND", message: "Column not found" };

    // Delete cards in column
    await Card.deleteMany({ columnId });
    
    // Remove from board's columnOrder
    await Board.findByIdAndUpdate(boardId, {
      $pull: { columnOrder: columnId },
    });

    await Column.findByIdAndDelete(columnId);

    return { message: "Column and associated cards deleted" };
  }

  async deleteBoard(boardId, userId) {
    const board = await Board.findById(boardId).populate("workspaceId");
    if (!board) throw { status: 404, code: "NOT_FOUND", message: "Board not found" };

    const member = board.workspaceId.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!member || member.role !== "owner") {
      throw { status: 403, code: "FORBIDDEN", message: "Only owners can delete boards" };
    }

    // Cascading deletes
    await Card.deleteMany({ boardId });
    await Column.deleteMany({ boardId });
    await Board.findByIdAndDelete(boardId);

    return { message: "Board and associated data deleted" };
  }
}

export default new BoardService();