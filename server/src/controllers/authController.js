import authService from "../services/authService.js";
import User from "../models/User.js";
import { success } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    return success(res, {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatarColor: user.avatarColor,
      },
    }, "Registration successful", 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    return success(res, {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatarColor: user.avatarColor,
        workspaces: user.workspaces,
      },
    }, "Login successful");
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    return success(res, tokens, "Token refreshed");
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user._id, refreshToken);
    return success(res, null, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-passwordHash -refreshTokens")
      .populate("workspaces", "name slug");
    return success(res, { user }, "User profile fetched");
  } catch (err) {
    next(err);
  }
};