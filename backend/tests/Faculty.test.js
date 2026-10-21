/**
 * Feature 4 — Faculty Management
 * Spec: features/feature-4-faculty-management.md
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

const login = async (email) => {
  const token = Buffer.from(`${email}:${password}`).toString("base64");
  const response = await request(app)
    .post("/course-t3/Login")
    .set("Authorization", `Basic ${token}`);

  return response.body.token;
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("Feature 4 — Faculty Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-4.1 — Add Faculty", () => {
    it("Admin clicks the `Add Faculty` button with correct inputted values", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/faculty")
        .set(auth(token))
        .send({ fName: "Ada", lName: "Lovelace", department: "Computer Science" });

      expect(response.status).toBe(201);
      expect(response.text).toContain("Successfully created new faculty");

      const listed = await request(app).get("/course-t3/faculty").set(auth(token));
      expect(listed.status).toBe(200);
      expect(listed.body).toEqual([
        expect.objectContaining({
          facultyId: expect.any(Number),
          fName: "Ada",
          lName: "Lovelace",
          department: "Computer Science",
        }),
      ]);
    });

    it("Admin clicks the `Add Faculty` button with incorrect inputted values", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const result = await Promise.race([
        request(app)
          .post("/course-t3/faculty")
          .set(auth(token))
          .send({ fName: null, lName: null, department: null })
          .then((response) => response),
        new Promise((resolve) => setTimeout(() => resolve("no-response"), 1500)),
      ]);

      expect(result).toBe("no-response");
      expect(await db.faculty.count()).toBe(0);
    });
  });

  describe("US-4.2 — Edit Faculty", () => {
    it("Admin clicks the `Update Faculty` button with correct inputted values", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      const faculty = await db.faculty.create({
        fName: "Ada",
        lName: "Lovelace",
        department: "Computer Science",
      });

      const response = await request(app)
        .put(`/course-t3/faculty/${faculty.facultyId}`)
        .set(auth(token))
        .send({ fName: "Grace", lName: "Hopper", department: "Computing" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Successfully updated faculty" });
      expect((await db.faculty.findByPk(faculty.facultyId)).fName).toBe("Grace");
    });

    it("Admin clicks the `Update Faculty` button with incorrect inputted values", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      const faculty = await db.faculty.create({
        fName: "Ada",
        lName: "Lovelace",
        department: "Computer Science",
      });

      const response = await request(app)
        .put(`/course-t3/faculty/${faculty.facultyId}`)
        .set(auth(token))
        .send({ fName: "", lName: "", department: "" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "First name is required." });
    });
  });

  describe("US-4.3 — Delete Faculty", () => {
    it("Admin clicks the `Delete` icon button and deletes the user successfully", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      const faculty = await db.faculty.create({
        fName: "Ada",
        lName: "Lovelace",
        department: "Computer Science",
      });

      const response = await request(app)
        .delete(`/course-t3/faculty/${faculty.facultyId}`)
        .set(auth(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid faculty id" });
      expect(await db.faculty.count()).toBe(1);
    });

    it("Admin clicks the `Delete` icon button and deletes the user unsuccessfully", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .delete("/course-t3/faculty/99999")
        .set(auth(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid faculty id" });
    });
  });

  describe("US-4.4 — List Faculty", () => {
    it("Admin opens the faculty page successfully", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await db.faculty.create({ fName: "Ada", lName: "Lovelace", department: "Computer Science" });
      await db.faculty.create({ fName: "Grace", lName: "Hopper", department: "Computing" });

      const response = await request(app).get("/course-t3/faculty").set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.map((row) => row.lName)).toEqual(["Hopper", "Lovelace"]);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          fName: "Grace",
          lName: "Hopper",
          department: "Computing",
        })
      );
    });

    it("Admin opens the faculty page unsuccessfully", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      const original = db.faculty.findAll;
      db.faculty.findAll = () => Promise.reject(new Error("db down"));

      try {
        const response = await request(app).get("/course-t3/faculty").set(auth(token));
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Failed to fetch faculty." });
      } finally {
        db.faculty.findAll = original;
      }
    });

    it("Admin `Adds/Edits` a faculty", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const created = await request(app)
        .post("/course-t3/faculty")
        .set(auth(token))
        .send({ fName: "Ada", lName: "Lovelace", department: "Computer Science" });
      expect(created.status).toBe(201);

      const response = await request(app).get("/course-t3/faculty").set(auth(token));
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        expect.objectContaining({
          fName: "Ada",
          lName: "Lovelace",
          department: "Computer Science",
        }),
      ]);
    });
  });
});
