/**
 * Feature 7 — Student Course Listing
 * Spec: features/unused/feature-7-student-course-listing.md
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

const createCourse = (courseId, courseName) =>
  db.course.create({
    courseId,
    courseName,
    semesterOffered: "FA",
    offeringFrequency: "everyYear",
    description: "software engineering class",
  });

describe("Feature 7 — Student Course Listing", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-7.1 — View my sections", () => {
    it("User cannot see other users signed up for courses", async () => {
      const userA = await createUser({ id: 1114442, email: "user-a@example.com" });
      const userB = await createUser({ id: 1027599, email: "user-b@example.com" });
      const token = await login("user-a@example.com");
      await db.semester.create({
        semesterId: "FA2026",
        startDate: "2026-08-18",
        endDate: "2026-12-06",
      });
      await db.faculty.create({
        facultyId: 1112233,
        fName: "Grace",
        lName: "Hopper",
        department: "Computer Science",
      });
      await createCourse("CMCS-3033", "Software Engineering");
      await createCourse("CMCS-2123", "Programming");
      await db.section.create({
        sectionId: "CMCS-3033-01",
        courseId: "CMCS-3033",
        facultyId: 1112233,
        dayOfWeek: "MWF",
        roomNum: "HSH 212",
        timeStart: "09:00:00",
        timeEnd: "10:15:00",
      });
      await db.section.create({
        sectionId: "CMCS-2123-01",
        courseId: "CMCS-2123",
        facultyId: 1112233,
        dayOfWeek: "TTH",
        roomNum: "NSW 201",
        timeStart: "11:00:00",
        timeEnd: "12:15:00",
      });
      await db.enrollment.create({
        universityId: userA.id,
        semesterId: "FA2026",
        sectionId: "CMCS-2123-01",
      });
      await db.enrollment.create({
        universityId: userB.id,
        semesterId: "FA2026",
        sectionId: "CMCS-3033-01",
      });

      const own = await request(app)
        .get("/course-t3/enrollments/1114442")
        .set(auth(token));
      const other = await request(app)
        .get("/course-t3/enrollments/1027599")
        .set(auth(token));

      expect(own.status).toBe(200);
      expect(own.body.map((row) => row.sectionId)).toEqual(["CMCS-2123-01"]);
      expect(other.status).toBe(404);
      expect(other.body).toEqual({ message: "no enrollments for user=1027599 found" });
    });
  });

  describe("US-7.3 — Private section list only", () => {
    it("User attempts to delete another user's list", async () => {
      await createUser({ id: 1114442, email: "user-a@example.com" });
      const userB = await createUser({ id: 1027599, email: "user-b@example.com" });
      const token = await login("user-a@example.com");
      await db.semester.create({
        semesterId: "FA2026",
        startDate: "2026-08-18",
        endDate: "2026-12-06",
      });
      await db.faculty.create({
        facultyId: 1112233,
        fName: "Grace",
        lName: "Hopper",
        department: "Computer Science",
      });
      await createCourse("CMCS-3033", "Software Engineering");
      await db.section.create({
        sectionId: "CMCS-3033-01",
        courseId: "CMCS-3033",
        facultyId: 1112233,
        dayOfWeek: "MWF",
        roomNum: "HSH 212",
        timeStart: "09:00:00",
        timeEnd: "10:15:00",
      });
      await db.enrollment.create({
        universityId: userB.id,
        semesterId: "FA2026",
        sectionId: "CMCS-3033-01",
      });

      const response = await request(app)
        .delete("/course-t3/enrollments/1027599/FA2026/CMCS-3033-01")
        .set(auth(token));

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "no enrollments for user=1027599 found" });
      expect(await db.enrollment.count()).toBe(1);
    });

    it("Unauthenticated API request to lists", async () => {
      const response = await request(app).get("/course-t3/enrollments/1114442");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized! No Auth Header" });
    });
  });
});
