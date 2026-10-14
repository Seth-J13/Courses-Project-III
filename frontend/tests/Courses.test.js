/**
 * Feature 3 — Course Management
 * Spec: features/feature-3-course-management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import CourseList from "../src/views/CourseList.vue";
import CoursesForm from "../src/components/CoursesForm.vue";
import courseServices from "../src/services/courseServices.js";
import Utils from "../src/config/utils.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/courseServices.js", () => ({
  default: {
    getCourses: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
  },
}));

const adminUser = {
  id: 1,
  email: "admin@example.com",
  fName: "Ada",
  lName: "Admin",
  role: "admin",
  token: "admin-token",
};

const course = (courseId, courseName = courseId) => ({
  courseId,
  courseName,
  semesterOffered: "FA",
  offeringFrequency: "everyYear",
  description: "XXXXXX",
});

const clickButton = async (label) => {
  const button = [...document.body.querySelectorAll("button")].find((node) =>
    node.textContent.includes(label)
  );
  button.click();
  await flushPromises();
};

const rowIds = (wrapper) =>
  wrapper.findAll("tbody tr").map((row) => row.find("td").text().trim());

describe("Feature 3 — Course Management", () => {
  let wrapper;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    courseServices.getCourses.mockResolvedValue({ data: [] });
    await router.push({ name: "Login" });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  const mountCourses = async (courses = []) => {
    Utils.setStore("user", adminUser);
    courseServices.getCourses.mockResolvedValue({ data: courses });
    ({ wrapper } = await mountWithPlugins(CourseList, { attachTo: document.body }));
    await flushPromises();
  };

  const openCreateDialog = async () => {
    await clickButton("+ New course");
  };

  const setForm = async (fields) => {
    const form = wrapper.findComponent(CoursesForm);
    form.vm.$emit("update:modelValue", {
      ...form.props("modelValue"),
      ...fields,
    });
    await flushPromises();
  };

  describe("US-3.1 — Create courses", () => {
    it("Admin creates a new course", async () => {
      await mountCourses();
      courseServices.createCourse.mockResolvedValue({ data: {} });
      courseServices.getCourses.mockResolvedValue({
        data: [course("CMSC-4324", "SE4")],
      });

      await openCreateDialog();
      await setForm({
        courseId: "CMSC-4324",
        courseName: "SE4",
        description: "XXXXXX",
        semesterOffered: "FA",
        offeringFrequency: "everyYear",
      });
      await clickButton("create");

      expect(courseServices.createCourse).toHaveBeenCalledWith({
        courseId: "CMSC-4324",
        courseName: "SE4",
        description: "XXXXXX",
        semesterOffered: "FA",
        offeringFrequency: "everyYear",
      });
      expect(wrapper.text()).toContain("CMSC-4324");
      expect(wrapper.findAllComponents({ name: "VDialog" })[0].props("modelValue")).toBe(false);
    });

    it("Admin creates a course with an empty name", async () => {
      await mountCourses();
      await openCreateDialog();
      await setForm({
        courseId: "CMSC-4324",
        courseName: "   ",
        description: "XXXXXX",
        semesterOffered: "FA",
        offeringFrequency: "everyYear",
      });
      await clickButton("create");

      expect(document.body.textContent).toContain("Required");
      expect(courseServices.createCourse).not.toHaveBeenCalled();
    });

    it("Admin creates a course with an empty description", async () => {
      await mountCourses();
      await openCreateDialog();
      await setForm({
        courseId: "CMSC-4324",
        courseName: "SE4",
        description: "   ",
        semesterOffered: "FA",
        offeringFrequency: "everyYear",
      });
      await clickButton("create");

      expect(document.body.textContent).toContain("Required");
      expect(courseServices.createCourse).not.toHaveBeenCalled();
    });

    it("Admin creates a course without semester", async () => {
      await mountCourses();
      await openCreateDialog();
      await setForm({
        courseId: "CMSC-4324",
        courseName: "SE4",
        description: "XXXXXX",
        semesterOffered: "   ",
        offeringFrequency: "everyYear",
      });
      await clickButton("create");

      expect(document.body.textContent).toContain("Required");
      expect(courseServices.createCourse).not.toHaveBeenCalled();
    });

    it("Admin creates a course with a name that is too long", async () => {
      await mountCourses();
      await openCreateDialog();
      await setForm({
        courseId: "CMSC-43241",
        courseName: "SE4",
        description: "XXXXXX",
        semesterOffered: "FA",
        offeringFrequency: "everyYear",
      });
      await clickButton("create");

      expect(document.body.textContent).toContain("ID must be 9 characters or fewer.");
      expect(courseServices.createCourse).not.toHaveBeenCalled();
    });

    it("Admin creates a course with an id that is improperly formatted", async () => {
      await mountCourses();
      courseServices.createCourse.mockRejectedValue({
        response: { data: { message: "Course id must look like CMSC-5322." } },
      });

      await openCreateDialog();
      await setForm({
        courseId: "NOT-VALID",
        courseName: "SE4",
        description: "XXXXXX",
        semesterOffered: "FA",
        offeringFrequency: "everyYear",
      });
      await clickButton("create");

      expect(document.body.textContent).toContain("Course id must look like CMSC-5322.");
    });
  });

  describe("US-3.2 — View all courses", () => {
    it("Course view loads with existing semesters", async () => {
      await mountCourses([
        course("CMSC-4321", "Software Engineering"),
        course("ARTS-3214", "Studio"),
      ]);

      expect(rowIds(wrapper).sort()).toEqual(["ARTS-3214", "CMSC-4321"]);
      expect(wrapper.findAll('[aria-label="Open course"]')).toHaveLength(2);
      expect(wrapper.findAll('[aria-label="Delete course"]')).toHaveLength(2);
    });

    it("No courses exist", async () => {
      await mountCourses();

      expect(wrapper.text()).toContain("No courses yet. Create your first course.");
    });
  });

  describe("US-3.3 — Manage course rows", () => {
    it("course rows show edit and delete actions", async () => {
      await mountCourses([course("CMSC-4321", "Software Engineering")]);

      const row = wrapper.findAll("tbody tr").find((node) => node.text().includes("CMSC-4321"));
      expect(row.find('[aria-label="Open course"]').exists()).toBe(true);
      expect(row.find('[aria-label="Delete course"]').exists()).toBe(true);
    });
  });

  describe("US-3.4 — Edit and delete courses", () => {
    it("Admin edits a course", async () => {
      await mountCourses([course("CMSC-4321", "Software Engineering")]);
      courseServices.updateCourse.mockResolvedValue({ data: {} });
      courseServices.getCourses.mockResolvedValue({
        data: [course("ARTS-4321", "Studio Art")],
      });

      const row = wrapper.findAll("tbody tr").find((node) => node.text().includes("CMSC-4321"));
      await row.get('[aria-label="Open course"]').trigger("click");
      await flushPromises();
      await setForm({
        courseId: "ARTS-4321",
        courseName: "Studio Art",
        description: "XXXXXX",
        semesterOffered: "FA",
        offeringFrequency: "everyYear",
      });
      await clickButton("update");

      expect(courseServices.updateCourse).toHaveBeenCalledWith("CMSC-4321", {
        courseId: "ARTS-4321",
        courseName: "Studio Art",
        description: "XXXXXX",
        semesterOffered: "FA",
        offeringFrequency: "everyYear",
      });
      expect(wrapper.text()).toContain("ARTS-4321");
      expect(wrapper.text()).not.toContain("CMSC-4321");
    });

    it("Admin deletes a course", async () => {
      await mountCourses([course("CMSC-4321", "Software Engineering")]);
      courseServices.deleteCourse.mockResolvedValue({ data: {} });
      courseServices.getCourses.mockResolvedValue({ data: [] });

      const row = wrapper.findAll("tbody tr").find((node) => node.text().includes("CMSC-4321"));
      await row.get('[aria-label="Delete course"]').trigger("click");
      await flushPromises();
      await clickButton("Delete Course");

      expect(courseServices.deleteCourse).toHaveBeenCalledWith("CMSC-4321");
      expect(wrapper.text()).not.toContain("CMSC-4321");
      expect(wrapper.text()).toContain("No courses yet. Create your first course.");
    });
  });

  describe("US-3.5 — Search courses", () => {
    it("Search bar appears with courses", async () => {
      await mountCourses([course("CMSC-4321", "Software Engineering")]);

      const find = wrapper
        .findAllComponents({ name: "VTextField" })
        .find((node) => node.props("label") === "Find");
      expect(find.exists()).toBe(true);
    });

    it("No search bar appears with no courses", async () => {
      await mountCourses();

      const find = wrapper
        .findAllComponents({ name: "VTextField" })
        .filter((node) => node.props("label") === "Find");
      expect(wrapper.text()).toContain("No courses yet. Create your first course.");
      expect(find).toHaveLength(0);
    });

    it("Admin types in course search bar", async () => {
      await mountCourses([
        course("CMSC-4321", "Software Engineering"),
        course("ARTS-3214", "Studio"),
        course("BIBL-3421", "Bible"),
        course("CMSC-1324", "Intro"),
      ]);
      const find = wrapper
        .findAllComponents({ name: "VTextField" })
        .find((node) => node.props("label") === "Find");
      await find.setValue("CMSC");

      expect(rowIds(wrapper).sort()).toEqual(["CMSC-1324", "CMSC-4321"]);
    });

    it("Admin types in course search bar 2", async () => {
      await mountCourses([
        course("CMSC-4321", "Software Engineering"),
        course("ARTS-3214", "Studio"),
        course("BIBL-4321", "Bible"),
        course("CMSC-1324", "Intro"),
      ]);
      const find = wrapper
        .findAllComponents({ name: "VTextField" })
        .find((node) => node.props("label") === "Find");
      await find.setValue("4321");

      expect(rowIds(wrapper).sort()).toEqual(["BIBL-4321", "CMSC-4321"]);
    });

    it("Unauthenticated user accesses the courses view", async () => {
      await router.push({ name: "CourseList" });

      expect(router.currentRoute.value.name).toBe("Login");
    });
  });
});
