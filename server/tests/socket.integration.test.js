import { io as ioc } from "socket.io-client";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "../src/app.js";
import User from "../models/User.js";
import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Card from "../models/Card.js";
import Workspace from "../models/Workspace.js";
import boardHandlers from "../src/sockets/boardHandlers.js";
import jwt from "jsonwebtoken";

const TEST_DB = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/kanban_socket_test";

describe("Socket.io Concurrency Tests", () => {
  let io, server, socket, httpServer;
  let port;
  let token, userId, boardId, columnId, cardId;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB);
    httpServer = createServer(app);
    io = new Server(httpServer);
    boardHandlers(io);

    return new Promise((resolve) => {
      httpServer.listen(() => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    io.close();
    httpServer.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Board.deleteMany({});
    await Column.deleteMany({});
    await Card.deleteMany({});

    // Setup user & data
    const user = await User.create({
      email: "socket@test.com",
      passwordHash: "hash",
      displayName: "Socket User"
    });
    userId = user._id;
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "test_secret");

    const ws = await Workspace.create({ name: "WS", slug: "ws", members: [{ userId, role: "owner" }] });
    const board = await Board.create({ workspaceId: ws._id, title: "Board", createdBy: userId });
    boardId = board._id;
    const col = await Column.create({ boardId, title: "Col", position: 0 });
    columnId = col._id;
    const card = await Card.create({ boardId, columnId, title: "Card", version: 0, createdBy: userId });
    cardId = card._id;

    return new Promise((resolve) => {
      socket = ioc(`http://localhost:${port}`);
      socket.on("connect", resolve);
    });
  });

  afterEach(() => {
    if (socket.connected) socket.disconnect();
  });

  test("should fire card:rejected when version conflict occurs", (done) => {
    socket.emit("board:join", { token, boardId: boardId.toString() });

    socket.on("board:state", () => {
      // Simulate stale update (client sends v0, but server is at v0)
      // Wait, if it's at v0, it should succeed.
      // Let's first do one successful update to move to v1.
      socket.emit("card:update", { cardId: cardId.toString(), patch: { title: "V1" }, clientVersion: 0 });
    });

    socket.on("card:updated", () => {
      // Now at v1. Client sends v0 (stale)
      socket.emit("card:update", { cardId: cardId.toString(), patch: { title: "V2 Stale" }, clientVersion: 0 });
    });

    socket.on("card:rejected", (data) => {
      expect(data.cardId).toBe(cardId.toString());
      expect(data.code).toBe("VERSION_CONFLICT");
      done();
    });
  });
});
