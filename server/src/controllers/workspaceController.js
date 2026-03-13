import workspaceService from "../services/workspaceService.js";

export const getAllWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.listWorkspaces(req.user._id);
    return res.json({ workspaces });
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
    return res.status(201).json({ workspace });
  } catch (err) {
    next(err);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const { workspace } = await workspaceService.inviteMember(
      req.params.id,
      email,
      role
    );
    return res.json({ message: "Member invited", workspace });
  } catch (err) {
    next(err);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteWorkspace(req.params.id, req.user._id);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};