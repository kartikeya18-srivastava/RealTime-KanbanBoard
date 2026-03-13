import boardService from "../services/boardService.js";
import Activity from "../models/Activity.js";

export const getBoards = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ message: "workspaceId is required" });
    
    const boards = await boardService.listBoards(workspaceId, req.user._id);
    return res.json({ boards });
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (req, res, next) => {
  try {
    const { workspaceId, title } = req.body;
    const board = await boardService.createBoard(workspaceId, title, req.user._id);
    return res.status(201).json({ board });
  } catch (err) {
    next(err);
  }
};

export const getBoard = async (req, res, next) => {
  try {
    const state = await boardService.getBoardState(req.params.id, req.user._id);
    return res.json(state);
  } catch (err) {
    next(err);
  }
};

export const deleteBoard = async (req, res, next) => {
  try {
    const result = await boardService.deleteBoard(req.params.id, req.user._id);
    return res.json(result);
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

    return res.json({
      activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
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

    return res.status(201).json({ column });
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
    return res.json({ column });
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

    return res.json(result);
  } catch (err) {
    next(err);
  }
};