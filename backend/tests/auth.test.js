/**
 * Feature 1 — User Auth & Session Management
 * Spec: features/feature-1-User-Auth-&-Session-Management.md
 */
import crypto from "crypto";
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { syncTestDatabase } from "./helpers.js";

const password = "password123";

const createUser = async ({ email, role }) => {
  const salt = crypto.randomBytes(16);
  const passwordHash = crypto.scryptSync(password, salt, 64);

  return db.user.create({
    fName: "Ada",
    lName: "Lovelace",
    email,
    password: passwordHash,
    salt,
    role,
  });
};

const basicAuth = (email, secret) =>
  `Basic ${Buffer.from(`${email}:${secret}`).toString("base64")}`;

describe("Feature 1 — User Auth & Session Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-1.1 — Sign in", () => {
    it("Bad email", async () => {
      const response = await request(app)
        .post("/course-t3/Login")
        .set("Authorization", basicAuth("missing@example.com", password));

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "User not found!" });
    });

    it("Bad password", async () => {
      await createUser({ email: "ada@example.com", role: "student" });

      const response = await request(app)
        .post("/course-t3/Login")
        .set("Authorization", basicAuth("ada@example.com", "wrong-password"));

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid password!" });
    });
  });

  describe("US-1.3 — Sign out", () => {
    it("Logging out", async () => {
      await createUser({ email: "ada@example.com", role: "student" });

      const login = await request(app)
        .post("/course-t3/Login")
        .set("Authorization", basicAuth("ada@example.com", password));

      expect(login.status).toBe(200);
      expect(login.body.token).toEqual(expect.any(String));

      const response = await request(app)
        .post("/course-t3/Logout")
        .set("Authorization", `Bearer ${login.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Signed out successfully." });
      expect(await db.session.count()).toBe(0);
    });
  });
});
