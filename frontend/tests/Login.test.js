/**
 * Feature 1 — User Auth & Session Management
 * Spec: features/feature-1-User-Auth-&-Session-Management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent } from "vue";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import Login from "../src/views/Login.vue";
import Register from "../src/views/Register.vue";
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

const adminSession = {
  id: 1,
  email: "admin@example.com",
  fName: "Ada",
  lName: "Admin",
  role: "admin",
  token: "admin-token",
};

const studentSession = {
  id: 2,
  email: "student@example.com",
  fName: "Sam",
  lName: "Student",
  role: "student",
  token: "student-token",
};

const fillLogin = async (wrapper, email, password) => {
  await wrapper.get('input[autocomplete="email"]').setValue(email);
  await wrapper.get('input[autocomplete="current-password"]').setValue(password);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("Feature 1 — User Auth & Session Management", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe("US-1.1 — Sign in", () => {
    it("Admin signs in", async () => {
      authServices.loginUser.mockResolvedValue({ data: adminSession });
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: "/", name: "Login", component: Login },
          { path: "/register", name: "Register", component: { template: "<div>Register</div>" } },
          { path: "/semester", name: "Semester", component: { template: "<div>Semesters</div>" } },
          { path: "/enrollment-list", name: "EnrollmentList", component: { template: "<div>Enrollments</div>" } },
        ],
      });
      await router.push("/");
      await router.isReady();

      ({ wrapper } = await mountWithPlugins(Login, { router, attachTo: document.body }));
      await fillLogin(wrapper, adminSession.email, "password123");

      expect(Utils.getStore("user").token).toBe("admin-token");
      expect(router.currentRoute.value.name).toBe("Semester");
    });

    it("Student signs in", async () => {
      authServices.loginUser.mockResolvedValue({ data: studentSession });
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: "/", name: "Login", component: Login },
          { path: "/register", name: "Register", component: { template: "<div>Register</div>" } },
          { path: "/semester", name: "Semester", component: { template: "<div>Semesters</div>" } },
          { path: "/enrollment-list", name: "EnrollmentList", component: { template: "<div>Enrollments</div>" } },
        ],
      });
      await router.push("/");
      await router.isReady();

      ({ wrapper } = await mountWithPlugins(Login, { router, attachTo: document.body }));
      await fillLogin(wrapper, studentSession.email, "password123");

      expect(Utils.getStore("user").token).toBe("student-token");
      expect(router.currentRoute.value.name).toBe("EnrollmentList");
    });
  });

  describe("US-1.2 — Stay signed in across page loads", () => {
    it("Changing pages", async () => {
      Utils.setStore("user", adminSession);
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: "/", name: "Login", component: { template: "<div>Login</div>" } },
          { path: "/course-list", name: "CourseList", component: { template: "<div>Courses</div>" } },
          { path: "/semester", name: "Semester", component: { template: "<div>Semesters</div>" } },
          { path: "/sections", name: "Sections", component: { template: "<div>Sections</div>" } },
          { path: "/faculty", name: "Faculty", component: { template: "<div>Faculty</div>" } },
        ],
      });
      await router.push("/");
      await router.isReady();

      const Shell = defineComponent({
        components: { MenuBar },
        template: "<v-app><MenuBar /></v-app>",
      });
      ({ wrapper } = await mountWithPlugins(Shell, { router, attachTo: document.body }));

      const courses = wrapper
        .findAllComponents({ name: "VBtn" })
        .find((node) => node.text().trim() === "Courses");
      expect(courses.props("to")).toEqual({ name: "CourseList" });
      await router.push(courses.props("to"));
      await flushPromises();

      expect(Utils.getStore("user").token).toBe("admin-token");
      expect(router.currentRoute.value.name).toBe("CourseList");
    });

    it("Refresh pages", async () => {
      Utils.setStore("user", adminSession);
      const Shell = defineComponent({
        components: { MenuBar },
        template: "<v-app><MenuBar /></v-app>",
      });

      ({ wrapper } = await mountWithPlugins(Shell, { attachTo: document.body }));
      expect(wrapper.text()).toContain("Courses");
      wrapper.unmount();

      ({ wrapper } = await mountWithPlugins(Shell, { attachTo: document.body }));
      expect(Utils.getStore("user").token).toBe("admin-token");
      expect(wrapper.text()).toContain("Courses");
      expect(wrapper.text()).not.toContain("Email");
    });
  });

  describe("US-1.4 — Create account", () => {
    it("Creating new account", async () => {
      authServices.registerUser.mockResolvedValue({
        data: { ...studentSession, token: "new-token" },
      });
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: "/", name: "Login", component: Login },
          { path: "/register", name: "Register", component: Register },
          { path: "/enrollment-list", name: "EnrollmentList", component: { template: "<div>Enrollments</div>" } },
          { path: "/semester", name: "Semester", component: { template: "<div>Semesters</div>" } },
        ],
      });
      await router.push("/");
      await router.isReady();

      const Shell = defineComponent({
        template: "<router-view />",
      });
      ({ wrapper } = await mountWithPlugins(Shell, { router, attachTo: document.body }));

      await wrapper.get("a").trigger("click");
      await flushPromises();

      await wrapper.get('input[autocomplete="given-name"]').setValue("Sam");
      await wrapper.get('input[autocomplete="family-name"]').setValue("Student");
      await wrapper.get('input[autocomplete="email"]').setValue("student@example.com");
      const passwords = wrapper.findAll('input[autocomplete="new-password"]');
      await passwords[0].setValue("password123");
      await passwords[1].setValue("password123");
      await wrapper.find("form").trigger("submit");
      await flushPromises();

      expect(Utils.getStore("user").token).toBe("new-token");
      expect(router.currentRoute.value.name).toBe("EnrollmentList");
    });
  });
});
