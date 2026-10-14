/**
 * Course app registration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import Register from "../src/views/Register.vue";
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

const fill = async (wrapper, overrides = {}) => {
  const values = {
    fName: "Sam",
    lName: "Student",
    email: "student@example.com",
    password: "password123",
    confirm: "password123",
    ...overrides,
  };

  await wrapper.get('input[autocomplete="given-name"]').setValue(values.fName);
  await wrapper.get('input[autocomplete="family-name"]').setValue(values.lName);
  await wrapper.get('input[autocomplete="email"]').setValue(values.email);
  const passwords = wrapper.findAll('input[autocomplete="new-password"]');
  await passwords[0].setValue(values.password);
  await passwords[1].setValue(values.confirm);
};

describe("Course registration", () => {
  let wrapper;
  let router;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "Login", component: { template: "<div>Login</div>" } },
        { path: "/register", name: "Register", component: Register },
        { path: "/enrollment-list", name: "EnrollmentList", component: { template: "<div>Enrollments</div>" } },
      ],
    });
    await router.push("/register");
    await router.isReady();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountRegister = async () => {
    ({ wrapper } = await mountWithPlugins(Register, { router, attachTo: document.body }));
  };

  it("Creates a student account and opens the enrollment list", async () => {
    authServices.registerUser.mockResolvedValue({
      data: {
        id: 2,
        email: "student@example.com",
        fName: "Sam",
        lName: "Student",
        role: "student",
        token: "new-token",
      },
    });
    await mountRegister();
    await fill(wrapper);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(authServices.registerUser).toHaveBeenCalledWith({
      fName: "Sam",
      lName: "Student",
      email: "student@example.com",
      password: "password123",
    });
    expect(Utils.getStore("user").token).toBe("new-token");
    expect(router.currentRoute.value.name).toBe("EnrollmentList");
  });

  it("Rejects an invalid email", async () => {
    await mountRegister();
    await fill(wrapper, { email: "not-an-email" });
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Enter a valid email address.");
    expect(authServices.registerUser).not.toHaveBeenCalled();
  });

  it("Requires a first name", async () => {
    await mountRegister();
    await fill(wrapper, { fName: "" });
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("First name is required.");
    expect(authServices.registerUser).not.toHaveBeenCalled();
  });

  it("Requires a password of at least 8 characters", async () => {
    await mountRegister();
    await fill(wrapper, { password: "short", confirm: "short" });
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Password must be at least 8 characters.");
    expect(authServices.registerUser).not.toHaveBeenCalled();
  });

  it("Requires the passwords to match", async () => {
    await mountRegister();
    await fill(wrapper, { confirm: "password124" });
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Passwords do not match.");
    expect(authServices.registerUser).not.toHaveBeenCalled();
  });

  it("Shows the API message when registration fails", async () => {
    authServices.registerUser.mockRejectedValue({
      response: { data: { message: "Email already in use." } },
    });
    await mountRegister();
    await fill(wrapper);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Email already in use.");
    expect(router.currentRoute.value.name).toBe("Register");
  });
});
