/**
 * Feature 5 — Section Management
 * Spec: features/Feature-5-Section-Management.md
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

const createCourse = (courseId = "CMSC-1111", courseName = "Intro") =>
  db.course.create({
    courseId,
    courseName,
    semesterOffered: "FA",
    offeringFrequency: "everyYear",
    description: "XXXXXX",
  });

const createFaculty = (facultyId = 1112233) =>
  db.faculty.create({
    facultyId,
    fName: "Ada",
    lName: "Lovelace",
    department: "Computer Science",
  });

const sectionBody = (overrides = {}) => ({
  sectionId: "CMSC-1111-01",
  courseId: "CMSC-1111",
  facultyId: 1112233,
  dayOfWeek: "Monday",
  roomNum: "HSH 212",
  timeStart: "09:00:00",
  timeEnd: "10:15:00",
  ...overrides,
});

describe("Feature 5 — Section Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-5.1 — Add Section", () => {
    it("Admin creates a valid section", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse();
      await createFaculty();

      const response = await request(app)
        .post("/course-t3/sections")
        .set(auth(token))
        .send(sectionBody());

      expect(response.status).toBe(201);
      expect(response.body.sectionId).toBe("CMSC-1111-01");
      expect(await db.section.count()).toBe(1);
    });

    it("Missing required field", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/sections")
        .set(auth(token))
        .send(sectionBody({ courseId: "" }));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "courseId is required." });
      expect(await db.section.count()).toBe(0);
    });

    it("Course does not exist", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createFaculty();

      const response = await request(app)
        .post("/course-t3/sections")
        .set(auth(token))
        .send(sectionBody({ courseId: "CMSC-9999", sectionId: "CMSC-9999-01" }));

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to create section." });
      expect(await db.section.count()).toBe(0);
    });

    it("Faculty does not exist", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse();

      const response = await request(app)
        .post("/course-t3/sections")
        .set(auth(token))
        .send(sectionBody({ facultyId: 1112233 }));

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to create section." });
      expect(await db.section.count()).toBe(0);
    });

    it("Time start is not before time end", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .post("/course-t3/sections")
        .set(auth(token))
        .send(sectionBody({ timeStart: "11:00:00", timeEnd: "10:00:00" }));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Time start must be less than time end." });
      expect(await db.section.count()).toBe(0);
    });

    it("Faculty is already taken", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse();
      await createFaculty();
      await request(app).post("/course-t3/sections").set(auth(token)).send(sectionBody());

      const response = await request(app)
        .post("/course-t3/sections")
        .set(auth(token))
        .send(
          sectionBody({
            sectionId: "CMSC-1111-02",
            roomNum: "NSW 102",
            timeStart: "10:00:00",
            timeEnd: "11:00:00",
          })
        );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Faculty is already taken for this time." });
    });

    it("Room is already taken", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse();
      await createFaculty();
      await createFaculty(1112234);
      await request(app).post("/course-t3/sections").set(auth(token)).send(sectionBody());

      const response = await request(app)
        .post("/course-t3/sections")
        .set(auth(token))
        .send(
          sectionBody({
            sectionId: "CMSC-1111-02",
            facultyId: 1112234,
            roomNum: "NSW 102",
            timeStart: "10:00:00",
            timeEnd: "11:00:00",
          })
        );

      expect(response.status).toBe(201);
      expect(response.body.roomNum).toBe("NSW 102");
    });
  });

  describe("US-5.2 — Edit Section", () => {
    it("Admin updates a section", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse();
      await createFaculty();
      await db.section.create(sectionBody({ roomNum: "NSW 201" }));

      const response = await request(app)
        .put("/course-t3/sections/CMSC-1111-01")
        .set(auth(token))
        .send(sectionBody({ roomNum: "NSW 202" }));

      expect(response.status).toBe(200);
      expect(response.body.roomNum).toBe("NSW 202");

      const listed = await request(app).get("/course-t3/sections").set(auth(token));
      expect(listed.body[0].roomNum).toBe("NSW 202");
    });

    it("Update a missing section", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse();
      await createFaculty();

      const response = await request(app)
        .put("/course-t3/sections/CMSC-1111-99")
        .set(auth(token))
        .send(sectionBody({ sectionId: "CMSC-1111-99" }));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Section does not exist." });
    });
  });

  describe("US-5.3 — Remove Section", () => {
    it("Admin deletes a section", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse();
      await createFaculty();
      await db.section.create(sectionBody());

      const response = await request(app)
        .delete("/course-t3/sections/CMSC-1111-01")
        .set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Section deleted." });
      expect(await db.section.count()).toBe(0);
    });

    it("Delete a missing section", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");

      const response = await request(app)
        .delete("/course-t3/sections/CMSC-1111-99")
        .set(auth(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Section does not exist." });
    });
  });

  describe("US-5.4 — List & Filter Sections", () => {
    it("Filter sections", async () => {
      await createUser({ email: "admin@example.com", role: "admin" });
      const token = await login("admin@example.com");
      await createCourse();
      await createFaculty();
      await createFaculty(1112234);
      await db.section.create(sectionBody({ dayOfWeek: "Monday", roomNum: "HSH 212" }));
      await db.section.create(
        sectionBody({
          sectionId: "CMSC-1111-02",
          facultyId: 1112234,
          dayOfWeek: "Wednesday",
          roomNum: "HSH 212",
          timeStart: "11:00:00",
          timeEnd: "12:15:00",
        })
      );

      const response = await request(app)
        .get("/course-t3/sections")
        .query({ dayOfWeek: "Monday" })
        .set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body.map((section) => section.sectionId)).toEqual(["CMSC-1111-01"]);
    });

    it("Student cannot access section management", async () => {
      await createUser({ email: "student@example.com", role: "student" });
      const token = await login("student@example.com");

      const response = await request(app).get("/course-t3/sections").set(auth(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
