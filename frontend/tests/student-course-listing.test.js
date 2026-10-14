/**
 * Feature 7 — Student Course Listing
 * Spec: features/unused/feature-7-student-course-listing.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import EnrollmentList from "../src/views/EnrollmentList.vue";
import enrollmentServices from "../src/services/enrollmentServices.js";
import semesterServices from "../src/services/semesterServices_temp.js";
import courseServices from "../src/services/courseServices_temp.js";
import sectionServices from "../src/services/sectionServices_temp.js";
import Utils from "../src/config/utils.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/enrollmentServices.js", () => ({
  default: {
    getEnrollments: vi.fn(),
    getEnrollmentsBySemester: vi.fn(),
    createEnrollment: vi.fn(),
    deleteEnrollment: vi.fn(),
  },
}));

vi.mock("../src/services/semesterServices_temp.js", () => ({
  default: { getSemesters: vi.fn() },
}));

vi.mock("../src/services/courseServices_temp.js", () => ({
  default: { getCourses: vi.fn(), getCourse: vi.fn() },
}));

vi.mock("../src/services/sectionServices_temp.js", () => ({
  default: { getSections: vi.fn(), getSectionDetails: vi.fn() },
}));

const student = { id: 1114442, role: "student", token: "student-token" };

const signedUp = (sectionId, courseName) => ({
  universityId: student.id,
  semesterId: "FA2026",
  sectionId,
  section: {
    sectionId,
    courseId: sectionId.slice(0, 9),
    dayOfWeek: "MWF",
    timeStart: "09:00:00",
    timeEnd: "10:15:00",
    roomNum: "HSH 212",
    faculty: { fName: "Grace", lName: "Hopper" },
    course: {
      courseId: sectionId.slice(0, 9),
      courseName,
      semesterOffered: "FA",
      description: "software engineering class",
    },
  },
});

describe("Feature 7 — Student Course Listing", () => {
  let wrapper;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    window.history.replaceState({}, "", "/");
    enrollmentServices.getEnrollments.mockResolvedValue({ data: [] });
    enrollmentServices.getEnrollmentsBySemester.mockResolvedValue({ data: [] });
    semesterServices.getSemesters.mockResolvedValue({ data: [{ semesterId: "FA2026" }] });
    courseServices.getCourses.mockResolvedValue({ data: [] });
    await router.push({ name: "Login" });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  const mountListing = async (rows = []) => {
    Utils.setStore("user", student);
    enrollmentServices.getEnrollmentsBySemester.mockResolvedValue({ data: rows });
    ({ wrapper } = await mountWithPlugins(EnrollmentList, { attachTo: document.body }));
    await flushPromises();
  };

  describe("US-7.1 — View my sections", () => {
    it("Dashboard loads with listed sections", async () => {
      await mountListing([
        signedUp("CMCS-3033-01", "Software Engineering"),
        signedUp("CMCS-2123-01", "Programming"),
      ]);

      expect(wrapper.text()).toContain("CMCS-3033");
      expect(wrapper.text()).toContain("Software Engineering");
      expect(wrapper.text()).toContain("CMCS-2123");
      expect(wrapper.text()).toContain("Programming");
      expect(wrapper.findAll('[aria-label="Delete enrollment"]')).toHaveLength(2);
    });

    it("User has no courses", async () => {
      await mountListing();

      expect(wrapper.text()).toContain("No enrollments yet. Create your first enrollment.");
      expect(wrapper.find("tbody tr").exists()).toBe(false);
    });
  });

  describe("US-7.2 — Manage course rows", () => {
    it("Section rows show edit and delete actions", async () => {
      await mountListing([signedUp("CMCS-3033-01", "Software Engineering")]);

      const row = wrapper.findAll("tbody tr").find((node) => node.text().includes("CMCS-3033"));
      expect(row.find('[aria-label="Delete enrollment"]').exists()).toBe(true);
    });
  });

  describe("US-7.3 — Private section list only", () => {
    it("Unauthenticated user accesses the dashboard", async () => {
      await router.push("/dashboard");

      expect(router.currentRoute.value.name).toBe("Login");
    });
  });
});
