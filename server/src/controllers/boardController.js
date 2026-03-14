import boardService from "../services/boardService.js";
import Activity from "../models/Activity.js";
import { success, error } from "../utils/response.js";

export const getBoards = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return error(res, "workspaceId is required", 400, "BAD_REQUEST");
    
    const boards = await boardService.listBoards(workspaceId, req.user._id);
    return success(res, { boards });
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (req, res, next) => {
  try {
    const { workspaceId, title } = req.body;
    const board = await boardService.createBoard(workspaceId, title, req.user._id);
    return success(res, { board }, "Board created", 201);
  } catch (err) {
    next(err);
  }
};

export const getBoard = async (req, res, next) => {
  try {
    const state = await boardService.getBoardState(req.params.id, req.user._id);
    return success(res, state);
  } catch (err) {
    next(err);
  }
};

export const deleteBoard = async (req, res, next) => {
  try {
    const result = await boardService.deleteBoard(req.params.id, req.user._id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

export const getBoardActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const activities = await Activity.find({ boardId: req.params.id })
      .populate("actorId", "displayName email avatarColor")
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Activity.countDocuments({ boardId: req.params.id });

    return success(res, {
      activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    }, "Activity fetched");
  } catch (err) {
    next(err);
  }
};

export const createColumn = async (req, res, next) => {
  try {
    const column = await boardService.createColumn(req.params.id, req.body.title, req.user._id);
    
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.id}`).emit("column:created", { column });
    }

    return success(res, { column }, "Column created", 201);
  } catch (err) {
    next(err);
  }
};

export const updateColumn = async (req, res, next) => {
  try {
    const column = await boardService.updateColumn(
      req.params.id, 
      req.params.columnId, 
      req.body.title, 
      req.user._id
    );
    return success(res, { column }, "Column updated");
  } catch (err) {
    next(err);
  }
};

export const deleteColumn = async (req, res, next) => {
  try {
    const result = await boardService.deleteColumn(
      req.params.id, 
      req.params.columnId, 
      req.user._id
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.id}`).emit("column:deleted", { columnId: req.params.columnId });
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
};