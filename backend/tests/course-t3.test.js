/**
 * Feature 3 — Course Management
 * Spec: features/feature-3-course-management.md
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

const createCourse = (course) =>
  db.course.create({
    courseName: course.courseId,
    semesterOffered: "FA",
    offeringFrequency: "everyYear",
    description: "XXXXXX",
    ...course,
  });

describe("Feature 3 — Course Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-3.1 — Create courses", () => {
    it("Admin creates a new course", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          courseId: "CMSC-4324",
          courseName: "SE4",
          description: "XXXXXX",
          semesterOffered: "FA",
          offeringFrequency: "everyYear",
        });

      expect(response.status).toBe(201);
      expect(response.body.courseId).toBe("CMSC-4324");
      expect(response.body.courseName).toBe("SE4");
      expect(response.body.description).toBe("XXXXXX");
      expect(response.body.semesterOffered).toBe("FA");
    });

    it("Admin creates a course with a name that is too long", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          courseId: "CMSC-43241",
          courseName: "SE4",
          description: "XXXXXX",
          semesterOffered: "FA",
          offeringFrequency: "everyYear",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course id must look like CMSC-5322." });
    });

    it("Admin creates a course with an id that is improperly formatted", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          courseId: "NOT-VALID",
          courseName: "SE4",
          description: "XXXXXX",
          semesterOffered: "FA",
          offeringFrequency: "everyYear",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course id must look like CMSC-5322." });
    });
  });

  describe("US-3.2 — View all courses", () => {
    it("Course view loads with existing semesters", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse({ courseId: "CMSC-4321", courseName: "Software Engineering" });
      await createCourse({ courseId: "ARTS-3214", courseName: "Studio" });

      const response = await request(app)
        .get("/course-t3/courses")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.map((course) => course.courseId)).toEqual(["ARTS-3214", "CMSC-4321"]);
    });
  });

  describe("US-3.4 — Edit and delete courses", () => {
    it("Admin edits a course", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse({ courseId: "CMSC-4321", courseName: "Software Engineering" });

      const response = await request(app)
        .put("/course-t3/courses/CMSC-4321")
        .set("Authorization", `Bearer ${token}`)
        .send({
          courseId: "ARTS-4321",
          courseName: "Studio Art",
          description: "XXXXXX",
          semesterOffered: "FA",
          offeringFrequency: "everyYear",
        });

      expect(response.status).toBe(200);

      const listed = await request(app)
        .get("/course-t3/courses")
        .set("Authorization", `Bearer ${token}`);

      expect(listed.body.map((course) => course.courseId)).toEqual(["ARTS-4321"]);
    });

    it("Admin deletes a course", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse({ courseId: "CMSC-4321", courseName: "Software Engineering" });

      const response = await request(app)
        .delete("/course-t3/courses/CMSC-4321")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(await db.course.count()).toBe(0);
    });
  });

  describe("US-3.5 — Search courses", () => {
    it("Unauthenticated API request to courses", async () => {
      const response = await request(app).get("/course-t3/courses");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized! No Auth Header" });
    });
  });
});
