import workspaceService from "../services/workspaceService.js";
import { success } from "../utils/response.js";

export const getAllWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.listWorkspaces(req.user._id);
    return success(res, { workspaces });
  } catch (err) {
    next(err);
  }
};

export const createWorkspace = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const workspace = await workspaceService.createWorkspace({
      name,
      slug,
      userId: req.user._id,
    });
    return success(res, { workspace }, "Workspace created", 201);
  } catch (err) {
    next(err);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const { workspace } = await workspaceService.inviteMember(
      req.params.id,
      req.user._id,
      email,
      role
    );
    return success(res, { workspace }, "Member invited");
  } catch (err) {
    next(err);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteWorkspace(req.params.id, req.user._id);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};