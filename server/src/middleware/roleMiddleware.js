import Workspace from "../models/Workspace.js";

export const requireMember = (minRole = "viewer") => {
  const roleRank = { viewer: 0, editor: 1, owner: 2 };

  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId;
      if (!workspaceId) return next();

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ code: "NOT_FOUND", message: "Workspace not found" });
      }

      const member = workspace.members.find(
        (m) => m.userId.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({ code: "FORBIDDEN", message: "Not a member of this workspace" });
      }

      if (roleRank[member.role] < roleRank[minRole]) {
        return res.status(403).json({
          code: "INSUFFICIENT_ROLE",
          message: `Requires ${minRole} role or higher`,
        });
      }

      req.workspace = workspace;
      req.memberRole = member.role;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const requireOwner = requireMember("owner");