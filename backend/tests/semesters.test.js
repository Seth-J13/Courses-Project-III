/**
 * Feature 2 — Semester Management
 * Spec: features/feature-2-semester-management.md
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

const createSemester = (semesterId, startDate = "2026-08-18", endDate = "2026-12-06") =>
  db.semester.create({ semesterId, startDate, endDate });

describe("Feature 2 — Semester Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-2.1 — Create semesters", () => {
    it("Admin creates a new semester", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          semesterId: "SP2026",
          startDate: "2026-08-18",
          endDate: "2026-12-06",
        });

      expect(response.status).toBe(201);
      expect(response.body.semesterId).toBe("SP2026");
      expect(response.body.startDate).toBe("2026-08-18");
      expect(response.body.endDate).toBe("2026-12-06");
    });

    it("Admin creates a semester with a name that is too long", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          semesterId: "SP20261",
          startDate: "2026-08-18",
          endDate: "2026-12-06",
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to create semester." });
    });

    it("Admin creates a semester with a name that is improperly formatted", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          semesterId: "HELLO",
          startDate: "2026-08-18",
          endDate: "2026-12-06",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester id must look like FA2026." });
    });

    it("Admin creates a semester with a start date or end date that is improperly formatted", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          semesterId: "SP2026",
          startDate: "13-40-2026",
          endDate: "2026-12-06",
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to create semester." });
    });

    it("Student tries creating a semester", async () => {
      await createUser({ email: "student@example.com", role: "student" });
      const token = await login("student@example.com");

      const response = await request(app)
        .post("/course-t3/semesters")
        .set("Authorization", `Bearer ${token}`)
        .send({
          semesterId: "SP2026",
          startDate: "2026-08-18",
          endDate: "2026-12-06",
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Forbidden! Admin access required." });
    });

    it("Visitor tries creating a semester", async () => {
      const response = await request(app).post("/course-t3/semesters").send({
        semesterId: "SP2026",
        startDate: "2026-08-18",
        endDate: "2026-12-06",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized! No Auth Header" });
    });
  });

  describe("US-2.2 — View all semesters", () => {
    it("Semesters view loads with existing semesters", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createSemester("FA2026");
      await createSemester("SP2026", "2026-01-12", "2026-05-08");
      await createSemester("FA2027", "2027-08-16", "2027-12-10");
      await createSemester("WI2027", "2027-01-11", "2027-05-07");
      await createSemester("SU2027", "2027-05-18", "2027-08-06");

      const response = await request(app)
        .get("/course-t3/semesters")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.map((semester) => semester.semesterId)).toEqual([
        "FA2026",
        "FA2027",
        "SP2026",
        "SU2027",
        "WI2027",
      ]);
    });

    it("Student can GET the semesters list", async () => {
      await createUser({ email: "student@example.com", role: "student" });
      const token = await login("student@example.com");
      await createSemester("SP2026", "2026-01-12", "2026-05-08");
      await createSemester("FA2027", "2027-08-16", "2027-12-10");

      const response = await request(app)
        .get("/course-t3/semesters")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.map((semester) => semester.semesterId).sort()).toEqual([
        "FA2027",
        "SP2026",
      ]);
    });

    it("Student can GET a semester by id", async () => {
      await createUser({ email: "student@example.com", role: "student" });
      const token = await login("student@example.com");
      await createSemester("SP2026", "2026-01-12", "2026-05-08");

      const response = await request(app)
        .get("/course-t3/semesters/SP2026")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      const semesters = Array.isArray(response.body) ? response.body : [response.body];
      expect(semesters.some((semester) => semester.semesterId === "SP2026")).toBe(true);
    });

    it("Unauthenticated API request to semesters", async () => {
      const response = await request(app).get("/course-t3/semesters");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized! No Auth Header" });
    });
  });

  describe("US-2.4 — Edit and delete semesters", () => {
    it("Admin edits a semester", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createSemester("SP2026", "2026-01-12", "2026-05-08");

      const response = await request(app)
        .put("/course-t3/semesters/SP2026")
        .set("Authorization", `Bearer ${token}`)
        .send({
          semesterId: "FA2027",
          startDate: "2026-08-18",
          endDate: "2027-04-28",
        });

      expect(response.status).toBe(200);

      const listed = await request(app)
        .get("/course-t3/semesters")
        .set("Authorization", `Bearer ${token}`);

      expect(listed.body.map((semester) => semester.semesterId)).toEqual(["FA2027"]);
      expect(listed.body[0].endDate).toBe("2027-04-28");
    });

    it("Admin deletes a semester", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createSemester("SP2026", "2026-01-12", "2026-05-08");

      const response = await request(app)
        .delete("/course-t3/semesters/SP2026")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(await db.semester.count()).toBe(0);
    });

    it("Student tries editing or deleting semesters", async () => {
      await createUser({ email: "student@example.com", role: "student" });
      const token = await login("student@example.com");
      await createSemester("SP2026", "2026-01-12", "2026-05-08");

      const update = await request(app)
        .put("/course-t3/semesters/SP2026")
        .set("Authorization", `Bearer ${token}`)
        .send({
          semesterId: "FA2027",
          startDate: "2026-08-18",
          endDate: "2027-04-28",
        });
      const remove = await request(app)
        .delete("/course-t3/semesters/SP2026")
        .set("Authorization", `Bearer ${token}`);

      expect(update.status).toBe(403);
      expect(update.body).toEqual({ message: "Forbidden! Admin access required." });
      expect(remove.status).toBe(403);
      expect(remove.body).toEqual({ message: "Forbidden! Admin access required." });
    });

    it("Visitor tries editing or deleting semesters", async () => {
      const update = await request(app).put("/course-t3/semesters/SP2026").send({
        semesterId: "FA2027",
      });
      const remove = await request(app).delete("/course-t3/semesters/SP2026");

      expect(update.status).toBe(401);
      expect(update.body).toEqual({ message: "Unauthorized! No Auth Header" });
      expect(remove.status).toBe(401);
      expect(remove.body).toEqual({ message: "Unauthorized! No Auth Header" });
    });
  });
});
