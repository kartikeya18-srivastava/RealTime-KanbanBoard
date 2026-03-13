import Workspace from "../models/Workspace.js";
import User from "../models/User.js";

class WorkspaceService {
  async listWorkspaces(userId) {
    return await Workspace.find({
      "members.userId": userId,
    }).populate("createdBy", "displayName email avatarColor");
  }

  async createWorkspace({ name, slug, userId }) {
    if (!name || !slug) {
      throw { status: 400, code: "VALIDATION_ERROR", message: "Name and slug required" };
    }

    const exists = await Workspace.findOne({ slug });
    if (exists) {
      throw { status: 409, code: "CONFLICT", message: "Slug already in use" };
    }

    const workspace = new Workspace({
      name,
      slug,
      createdBy: userId,
      members: [{ userId, role: "owner" }],
    });

    await workspace.save();

    await User.findByIdAndUpdate(userId, {
      $push: { workspaces: workspace._id },
    });

    return workspace;
  }

  async inviteMember(workspaceId, email, role) {
    const invitee = await User.findOne({ email });
    if (!invitee) {
      throw { status: 404, code: "NOT_FOUND", message: "User not found" };
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { status: 404, code: "NOT_FOUND", message: "Workspace not found" };
    }

    const alreadyMember = workspace.members.find(
      (m) => m.userId.toString() === invitee._id.toString()
    );
    if (alreadyMember) {
      throw { status: 400, code: "ALREADY_MEMBER", message: "User is already a member" };
    }

    workspace.members.push({ userId: invitee._id, role: role || "editor" });
    await workspace.save();

    await User.findByIdAndUpdate(invitee._id, {
      $push: { workspaces: workspace._id },
    });

    return { workspace, invitee };
  }

  async deleteWorkspace(workspaceId, userId) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { status: 404, code: "NOT_FOUND", message: "Workspace not found" };
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!member || member.role !== "owner") {
      throw { status: 403, code: "FORBIDDEN", message: "Only owners can delete workspaces" };
    }

    // Cascading deletion
    const Board = (await import("../models/Board.js")).default;
    const Column = (await import("../models/Column.js")).default;
    const Card = (await import("../models/Card.js")).default;
    
    const boards = await Board.find({ workspaceId });
    const boardIds = boards.map(b => b._id);

    await Card.deleteMany({ boardId: { $in: boardIds } });
    await Column.deleteMany({ boardId: { $in: boardIds } });
    await Board.deleteMany({ workspaceId });

    // Remove workspace from user accounts
    await User.updateMany(
      { workspaces: workspaceId },
      { $pull: { workspaces: workspaceId } }
    );

    await Workspace.findByIdAndDelete(workspaceId);

    return { message: "Workspace and all associated boards deleted" };
  }
}

export default new WorkspaceService();