/**
 * Course app MenuBar
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent } from "vue";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import MenuBar from "../src/components/MenuBar.vue";
import authServices from "../src/services/authServices.js";
import Utils from "../src/config/utils.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: {
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
  },
}));

vi.mock("../src/services/userServices.js", () => ({
  default: {
    getUser: vi.fn(),
    updateUser: vi.fn(),
  },
}));

const admin = {
  id: 1,
  universityId: 1,
  email: "admin@example.com",
  username: "ada",
  fName: "Ada",
  lName: "Admin",
  role: "admin",
  token: "admin-token",
};

const student = {
  id: 2,
  universityId: 2,
  email: "student@example.com",
  username: "sam",
  fName: "Sam",
  lName: "Student",
  role: "student",
  token: "student-token",
};

const Shell = defineComponent({
  components: { MenuBar },
  template: "<v-app><MenuBar /></v-app>",
});

const courseRouter = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "Login", component: { template: "<div>Login</div>" } },
      { path: "/semester", name: "Semester", component: { template: "<div>Semesters</div>" } },
      { path: "/course-list", name: "CourseList", component: { template: "<div>Courses</div>" } },
      { path: "/sections", name: "Sections", component: { template: "<div>Sections</div>" } },
      { path: "/faculty", name: "Faculty", component: { template: "<div>Faculty</div>" } },
      { path: "/enrollment-list", name: "EnrollmentList", component: { template: "<div>Enrollments</div>" } },
    ],
  });
  await router.push("/");
  await router.isReady();
  return router;
};

describe("Course MenuBar", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authServices.logoutUser.mockResolvedValue();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it("Admin sees semester, course, section, and faculty links", async () => {
    Utils.setStore("user", admin);
    const router = await courseRouter();
    ({ wrapper } = await mountWithPlugins(Shell, { router, attachTo: document.body }));

    expect(wrapper.text()).toContain("Enrollment Management System");
    expect(wrapper.text()).toContain("Semesters");
    expect(wrapper.text()).toContain("Courses");
    expect(wrapper.text()).toContain("Sections");
    expect(wrapper.text()).toContain("Faculty");

    const destination = (label) =>
      wrapper.findAllComponents({ name: "VBtn" }).find((node) => node.text().trim() === label).props("to");

    expect(destination("Semesters")).toEqual({ name: "Semester" });
    expect(destination("Courses")).toEqual({ name: "CourseList" });
    expect(destination("Sections")).toEqual({ name: "Sections" });
    expect(destination("Faculty")).toEqual({ name: "Faculty" });
  });

  it("Student does not see admin links", async () => {
    Utils.setStore("user", student);
    const router = await courseRouter();
    ({ wrapper } = await mountWithPlugins(Shell, { router, attachTo: document.body }));

    expect(wrapper.text()).toContain("Enrollment Management System");
    expect(wrapper.text()).not.toContain("Semesters");
    expect(wrapper.text()).not.toContain("Courses");
    expect(wrapper.text()).not.toContain("Sections");
    expect(wrapper.text()).not.toContain("Faculty");
  });

  it("Signed-in user can sign out from the profile menu", async () => {
    Utils.setStore("user", admin);
    const router = await courseRouter();
    ({ wrapper } = await mountWithPlugins(Shell, { router, attachTo: document.body }));

    await wrapper.get('[aria-label="Open profile menu"]').trigger("click");
    await flushPromises();

    expect(document.body.textContent).toContain("Ada Admin");
    expect(document.body.textContent).toContain("admin@example.com");
    expect(document.body.textContent).toContain("Sign out");

    const signOut = [...document.body.querySelectorAll(".v-list-item")].find((node) =>
      node.textContent.includes("Sign out")
    );
    signOut.click();
    await flushPromises();

    expect(authServices.logoutUser).toHaveBeenCalled();
  });
});
