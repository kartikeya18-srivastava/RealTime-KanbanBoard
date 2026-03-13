import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

class AuthService {
  generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ userId, jti: crypto.randomUUID() }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
  }

  async register({ email, password, displayName }) {
    if (!email || !password || !displayName) {
      throw { status: 400, code: "VALIDATION_ERROR", message: "All fields required" };
    }

    const exists = await User.findOne({ email });
    if (exists) {
      throw { status: 409, code: "CONFLICT", message: "Email already registered" };
    }

    const user = new User({ email, passwordHash: password, displayName });
    await user.save();

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw { status: 400, code: "VALIDATION_ERROR", message: "Email and password required" };
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw { status: 401, code: "INVALID_CREDENTIALS", message: "Invalid email or password" };
    }

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async refresh(token) {
    if (!token) {
      throw { status: 400, code: "VALIDATION_ERROR", message: "Refresh token required" };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      throw { status: 401, code: "INVALID_TOKEN", message: "Invalid refresh token" };
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(token)) {
      throw { status: 401, code: "TOKEN_REUSE", message: "Refresh token not recognized" };
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
  }
}

export default new AuthService();