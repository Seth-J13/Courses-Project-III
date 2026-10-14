/**
 * Feature 6 — Enrollment Management
 * Spec: features/feature-6-enrollment-management.md
 */
import crypto from "crypto";
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { syncTestDatabase } from "./helpers.js";

const password = "password123";

const createUser = async ({ id, email }) => {
  const salt = crypto.randomBytes(16);
  const passwordHash = crypto.scryptSync(password, salt, 64);

  return db.user.create({
    id,
    fName: "Ada",
    lName: "Lovelace",
    email,
    password: passwordHash,
    salt,
    role: "student",
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

const createSemester = (semesterId) =>
  db.semester.create({
    semesterId,
    startDate: "2026-08-18",
    endDate: "2026-12-06",
  });

const createCourse = (courseId, courseName) =>
  db.course.create({
    courseId,
    courseName,
    semesterOffered: "FA",
    offeringFrequency: "everyYear",
    description: "XXXXXX",
  });

const createSection = (sectionId, courseId, facultyId) =>
  db.section.create({
    sectionId,
    courseId,
    facultyId,
    dayOfWeek: "MWF",
    roomNum: "HSH 212",
    timeStart: "09:00:00",
    timeEnd: "10:15:00",
  });

describe("Feature 6 — Enrollment Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-6.1 — View Current Enrollments", () => {
    it("view enrollment list with enrollments", async () => {
      const student = await createUser({ id: 1114442, email: "ada@example.com" });
      const token = await login("ada@example.com");
      await createSemester("FA2026");
      await db.faculty.create({
        facultyId: 1112233,
        fName: "Grace",
        lName: "Hopper",
        department: "Computer Science",
      });
      await createCourse("CMSC-1113", "Programming I");
      await createSection("CMSC-1113-01", "CMSC-1113", 1112233);
      await db.enrollment.create({
        universityId: student.id,
        semesterId: "FA2026",
        sectionId: "CMSC-1113-01",
      });

      const response = await request(app)
        .get("/course-t3/enrollments/1114442")
        .set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.map((row) => row.sectionId)).toContain("CMSC-1113-01");
    });

    it("view only enrollments matching semesterId", async () => {
      const student = await createUser({ id: 1114442, email: "ada@example.com" });
      const token = await login("ada@example.com");
      await createSemester("FA2026");
      await createSemester("SP2027");
      await db.faculty.create({
        facultyId: 1112233,
        fName: "Grace",
        lName: "Hopper",
        department: "Computer Science",
      });
      await createCourse("CMSC-1113", "Programming I");
      await createCourse("CMSC-2213", "Programming II");
      await createCourse("ENGL-5243", "Writing");
      await createSection("CMSC-1113-01", "CMSC-1113", 1112233);
      await createSection("CMSC-2213-01", "CMSC-2213", 1112233);
      await createSection("ENGL-5243-02", "ENGL-5243", 1112233);
      await db.enrollment.create({ universityId: student.id, semesterId: "FA2026", sectionId: "CMSC-1113-01" });
      await db.enrollment.create({ universityId: student.id, semesterId: "FA2026", sectionId: "CMSC-2213-01" });
      await db.enrollment.create({ universityId: student.id, semesterId: "SP2027", sectionId: "ENGL-5243-02" });

      const response = await request(app)
        .get("/course-t3/enrollments/1114442/FA2026")
        .set(auth(token));

      expect(response.status).toBe(201);
      expect(response.body.map((row) => row.sectionId).sort()).toEqual([
        "CMSC-1113-01",
        "CMSC-2213-01",
      ]);
    });

    it("student cannot fetch another user's enrollments", async () => {
      await createUser({ id: 1114442, email: "ada@example.com" });
      const other = await createUser({ id: 1027599, email: "other@example.com" });
      const token = await login("ada@example.com");
      await createSemester("FA2026");
      await db.faculty.create({
        facultyId: 1112233,
        fName: "Grace",
        lName: "Hopper",
        department: "Computer Science",
      });
      await createCourse("CMSC-1113", "Programming I");
      await createSection("CMSC-1113-01", "CMSC-1113", 1112233);
      await db.enrollment.create({
        universityId: other.id,
        semesterId: "FA2026",
        sectionId: "CMSC-1113-01",
      });

      const list = await request(app)
        .get("/course-t3/enrollments/1027599")
        .set(auth(token));
      const bySemester = await request(app)
        .get("/course-t3/enrollments/1027599/FA2026")
        .set(auth(token));

      expect(list.status).toBe(404);
      expect(list.body).toEqual({ message: "no enrollments for user=1027599 found" });
      expect(list.body.sectionId).toBeUndefined();
      expect(bySemester.status).toBe(404);
      expect(bySemester.body).toEqual({ message: "no enrollments for user=1027599 found" });
    });
  });

  describe("US-6.3 — Add Enrollment", () => {
    it("Create valid enrollment", async () => {
      const student = await createUser({ id: 1114442, email: "ada@example.com" });
      const token = await login("ada@example.com");
      await createSemester("FA2026");
      await db.faculty.create({
        facultyId: 1112233,
        fName: "Grace",
        lName: "Hopper",
        department: "Computer Science",
      });
      await createCourse("CMSC-1113", "Programming I");
      await createSection("CMSC-1113-01", "CMSC-1113", 1112233);

      const response = await request(app)
        .post("/course-t3/enrollments/1114442")
        .set(auth(token))
        .send({
          universityId: student.id,
          semesterId: "FA2026",
          sectionId: "CMSC-1113-01",
        });

      expect(response.status).toBe(201);
      expect(response.body.sectionId).toBe("CMSC-1113-01");
      expect(response.body.semesterId).toBe("FA2026");
      expect(await db.enrollment.count()).toBe(1);
    });
  });

  describe("US-6.4 — Remove Enrollment", () => {
    it("Confirm delete icon", async () => {
      const student = await createUser({ id: 1114442, email: "ada@example.com" });
      const token = await login("ada@example.com");
      await createSemester("FA2026");
      await db.faculty.create({
        facultyId: 1112233,
        fName: "Grace",
        lName: "Hopper",
        department: "Computer Science",
      });
      await createCourse("CMSC-1113", "Programming I");
      await createSection("CMSC-1113-01", "CMSC-1113", 1112233);
      await db.enrollment.create({
        universityId: student.id,
        semesterId: "FA2026",
        sectionId: "CMSC-1113-01",
      });

      const response = await request(app)
        .delete("/course-t3/enrollments/1114442/FA2026/CMSC-1113-01")
        .set(auth(token));

      expect(response.status).toBe(204);
      expect(await db.enrollment.count()).toBe(0);
    });
  });

  describe("US-6.5 — Seek semesters pagination", () => {
    it("EnrollmentList First Landing", async () => {
      const student = await createUser({ id: 1114442, email: "ada@example.com" });
      const token = await login("ada@example.com");
      await createSemester("FA2026");
      await createSemester("SP2027");
      await db.faculty.create({
        facultyId: 1112233,
        fName: "Grace",
        lName: "Hopper",
        department: "Computer Science",
      });
      await createCourse("CMSC-1113", "Programming I");
      await createCourse("ENGL-5243", "Writing");
      await createSection("CMSC-1113-01", "CMSC-1113", 1112233);
      await createSection("ENGL-5243-02", "ENGL-5243", 1112233);
      await db.enrollment.create({ universityId: student.id, semesterId: "FA2026", sectionId: "CMSC-1113-01" });
      await db.enrollment.create({ universityId: student.id, semesterId: "SP2027", sectionId: "ENGL-5243-02" });

      const response = await request(app)
        .get("/course-t3/enrollments/1114442/FA2026")
        .set(auth(token));

      expect(response.status).toBe(201);
      expect(response.body.map((row) => row.sectionId)).toEqual(["CMSC-1113-01"]);
    });
  });

  describe("US-6.6 — No editing enrollments", () => {
    it("PUT to enrollments is rejected", async () => {
      await createUser({ id: 1114442, email: "ada@example.com" });
      const token = await login("ada@example.com");

      const response = await request(app)
        .put("/course-t3/enrollments/1114442/FA2026/CMSC-1113-01")
        .set(auth(token))
        .send({ sectionId: "CMSC-1113-02" });

      expect(response.status).toBe(405);
      expect(response.body).toEqual({ message: "enrollments are dropped, not edited" });
    });
  });
});
