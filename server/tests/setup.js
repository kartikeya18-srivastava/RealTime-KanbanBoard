import { config } from "dotenv";
config({ path: ".env" });

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_for_testing";
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "test_refresh_secret_for_testing";
process.env.MONGO_URI_TEST = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/kanban_test";