import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Workspace from "../src/models/Workspace.js";
import Board from "../src/models/Board.js";
import Column from "../src/models/Column.js";
import Card from "../src/models/Card.js";

const TEST_DB = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/kanban_challenge_test";

describe("Challenge 01 Integration Tests", () => {
    let accessToken;
    let userId;
    let workspaceId;
    let boardId;
    let columnId;
    let cardId;

    beforeAll(async () => {
        await mongoose.connect(TEST_DB);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Workspace.deleteMany({});
        await Board.deleteMany({});
        await Column.deleteMany({});
        await Card.deleteMany({});
    });

    const setupFullTree = async () => {
        // 1. Register/Login
        const authRes = await request(app).post("/api/auth/register").send({
            email: "challenge@test.com",
            password: "password123",
            displayName: "Challenge User"
        });
        accessToken = authRes.body.accessToken;
        userId = authRes.body.user.id;

        // 2. Create Workspace
        const wsRes = await request(app)
            .post("/api/workspaces")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "C1 Workspace", slug: "c1-ws" });
        workspaceId = wsRes.body.workspace._id;

        // 3. Create Board
        const bRes = await request(app)
            .post("/api/boards")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ workspaceId, title: "C1 Board" });
        boardId = bRes.body.board._id;

        // 4. Create Column
        const cRes = await request(app)
            .post(`/api/boards/${boardId}/columns`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "To Do" });
        columnId = cRes.body.column._id;

        // 5. Create Card
        const cardRes = await request(app)
            .post("/api/cards")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ boardId, columnId, title: "Test Card" });
        cardId = cardRes.body.card._id;
    };

    describe("Concurrency Control (Optimistic Locking)", () => {
        test("should reject update when client version is stale", async () => {
            await setupFullTree();

            // First user updates card (v0 -> v1)
            await request(app)
                .patch(`/api/cards/${cardId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ title: "Updated by User A", clientVersion: 0 });

            // Second user attempts update with stale v0
            const res = await request(app)
                .patch(`/api/cards/${cardId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ title: "Updated by User B", clientVersion: 0 });

            expect(res.status).toBe(409);
            expect(res.body.code).toBe("VERSION_CONFLICT");
            expect(res.body.message).toContain("modified by another user");
        });

        test("should increment version on successful update", async () => {
            await setupFullTree();

            const res = await request(app)
                .patch(`/api/cards/${cardId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ title: "New Title", clientVersion: 0 });

            expect(res.status).toBe(200);
            expect(res.body.card.version).toBe(1);
            expect(res.body.card.title).toBe("New Title");
        });
    });

    describe("Auth Flow", () => {
        test("should allow registration and login", async () => {
            const regRes = await request(app).post("/api/auth/register").send({
                email: "auth@test.com",
                password: "password123",
                displayName: "Auth User"
            });
            expect(regRes.status).toBe(201);
            expect(regRes.body.accessToken).toBeDefined();

            const loginRes = await request(app).post("/api/auth/login").send({
                email: "auth@test.com",
                password: "password123"
            });
            expect(loginRes.status).toBe(200);
            expect(loginRes.body.accessToken).toBeDefined();
        });

        test("should refresh tokens successfully", async () => {
            const regRes = await request(app).post("/api/auth/register").send({
                email: "refresh@test.com",
                password: "password123",
                displayName: "Refresh User"
            });
            const oldRefreshToken = regRes.body.refreshToken;

            const refreshRes = await request(app).post("/api/auth/refresh").send({
                refreshToken: oldRefreshToken
            });

            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body.accessToken).toBeDefined();
            expect(refreshRes.body.refreshToken).toBeDefined();
            expect(refreshRes.body.refreshToken).not.toBe(oldRefreshToken);
        });
    });

    describe("Workspaces & Roles", () => {
        test("should allow creating and listing workspaces", async () => {
            await setupFullTree();
            const res = await request(app)
                .get("/api/workspaces")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.workspaces.length).toBeGreaterThan(0);
        });
    });
});
