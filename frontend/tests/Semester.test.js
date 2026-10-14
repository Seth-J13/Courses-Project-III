/**
 * Feature 2 — Semester Management
 * Spec: features/feature-2-semester-management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Semester from "../src/views/Semester.vue";
import SemesterForm from "../src/components/SemesterForm.vue";
import semesterServices from "../src/services/semesterServices.js";
import Utils from "../src/config/utils.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/semesterServices.js", () => ({
  default: {
    getSemesters: vi.fn(),
    createSemester: vi.fn(),
    updateSemester: vi.fn(),
    deleteSemester: vi.fn(),
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

const studentUser = {
  id: 2,
  email: "student@example.com",
  fName: "Sam",
  lName: "Student",
  role: "student",
  token: "student-token",
};

const semester = (semesterId, startDate, endDate) => ({
  semesterId,
  startDate,
  endDate,
});

const catalog = [
  semester("FA2026", "2026-08-16", "2026-12-06"),
  semester("FA2027", "2027-08-16", "2027-12-10"),
  semester("SP2026", "2026-01-12", "2026-05-08"),
  semester("SU2027", "2027-05-18", "2027-08-06"),
  semester("WI2027", "2027-01-11", "2027-05-07"),
];

const clickButton = async (label) => {
  const button = [...document.body.querySelectorAll("button")].find((node) =>
    node.textContent.includes(label)
  );
  button.click();
  await flushPromises();
};

const rowIds = (wrapper) =>
  wrapper.findAll("tbody tr").map((row) => row.find("td").text().trim());

describe("Feature 2 — Semester Management", () => {
  let wrapper;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    semesterServices.getSemesters.mockResolvedValue({ data: [] });
    await router.push({ name: "Login" });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  const mountSemesters = async (semesters = []) => {
    Utils.setStore("user", adminUser);
    semesterServices.getSemesters.mockResolvedValue({ data: semesters });
    ({ wrapper } = await mountWithPlugins(Semester, {
      attachTo: document.body,
    }));
    await flushPromises();
  };

  const openCreateDialog = async () => {
    await clickButton("+ New semester");
  };

  const setSemesterId = async (value) => {
    const field = wrapper
      .findAllComponents({ name: "VTextField" })
      .find((node) => node.props("label") === "Semester ID");
    await field.setValue(value);
  };

  const setDates = async (startDate, endDate) => {
    const form = wrapper.findComponent(SemesterForm);
    form.vm.$emit("update:modelValue", {
      ...form.props("modelValue"),
      startDate,
      endDate,
    });
    await flushPromises();
  };

  describe("US-2.1 — Create semesters", () => {
    it("Admin creates a new semester", async () => {
      await mountSemesters();
      semesterServices.createSemester.mockResolvedValue({ data: {} });
      semesterServices.getSemesters.mockResolvedValue({
        data: [semester("SP2026", "2026-08-18", "2026-12-06")],
      });

      await openCreateDialog();
      await setSemesterId("SP2026");
      await setDates("2026-08-18", "2026-12-06");
      await clickButton("Create");

      expect(semesterServices.createSemester).toHaveBeenCalledWith({
        semesterId: "SP2026",
        startDate: new Date("2026-08-18").toISOString(),
        endDate: new Date("2026-12-06").toISOString(),
      });
      expect(wrapper.text()).toContain("SP2026");
      expect(wrapper.findAllComponents({ name: "VDialog" })[0].props("modelValue")).toBe(false);
    });

    it("Admin creates a semester with an empty name", async () => {
      await mountSemesters();
      await openCreateDialog();
      await clickButton("Create");

      expect(document.body.textContent).toContain("Required");
      expect(semesterServices.createSemester).not.toHaveBeenCalled();
    });

    it("Admin creates a semester with an empty start date", async () => {
      await mountSemesters();
      await openCreateDialog();
      await setSemesterId("SP2026");
      await setDates("", "2026-12-06");
      await clickButton("Create");

      expect(semesterServices.createSemester).not.toHaveBeenCalled();
      expect(document.body.textContent).toContain("Failed to create semester.");
    });

    it("Admin creates a semester with an empty end date", async () => {
      await mountSemesters();
      await openCreateDialog();
      await setSemesterId("SP2026");
      await setDates("2026-08-18", "");
      await clickButton("Create");

      expect(semesterServices.createSemester).not.toHaveBeenCalled();
      expect(document.body.textContent).toContain("Failed to create semester.");
    });

    it("Admin creates a semester with a name that is too long", async () => {
      await mountSemesters();
      await openCreateDialog();
      await setSemesterId("SP20261");
      await setDates("2026-08-18", "2026-12-06");
      await clickButton("Create");

      expect(document.body.textContent).toContain("ID must be 6 characters or fewer.");
      expect(semesterServices.createSemester).not.toHaveBeenCalled();
    });

    it("Admin creates a semester with a name that is improperly formatted", async () => {
      await mountSemesters();
      semesterServices.createSemester.mockRejectedValue({
        response: { data: { message: "Semester id must look like FA2026." } },
      });

      await openCreateDialog();
      await setSemesterId("HELLO");
      await setDates("2026-08-18", "2026-12-06");
      await clickButton("Create");

      expect(document.body.textContent).toContain("Semester id must look like FA2026.");
    });

    it("Admin creates a semester with a start date or end date that is improperly formatted", async () => {
      await mountSemesters();
      await openCreateDialog();
      await setSemesterId("SP2026");
      await setDates("13-40-2026", "2026-12-06");
      await clickButton("Create");

      expect(semesterServices.createSemester).not.toHaveBeenCalled();
      expect(document.body.textContent).toContain("Failed to create semester.");
    });
  });

  describe("US-2.2 — View all semesters", () => {
    it("Semesters view loads with existing semesters", async () => {
      await mountSemesters(catalog);

      expect(rowIds(wrapper)).toEqual(["FA2026", "FA2027", "SP2026", "SU2027", "WI2027"]);
      expect(wrapper.findAll('[aria-label="Open semester"]')).toHaveLength(5);
      expect(wrapper.findAll('[aria-label="Delete semester"]')).toHaveLength(5);
    });

    it("No semesters exist", async () => {
      await mountSemesters();

      expect(wrapper.text()).toContain("No semesters yet. Create your first semester.");
    });

    it("Student user accesses the semester view", async () => {
      Utils.setStore("user", studentUser);

      await router.push({ name: "EnrollmentList" });
      await router.push({ name: "Semester" });

      expect(Utils.getStore("user").token).toBe("student-token");
      expect(router.currentRoute.value.name).toBe("Semester");
    });

    it("Unauthenticated user accesses the semester view", async () => {
      await router.push({ name: "Semester" });

      expect(router.currentRoute.value.name).toBe("Login");
    });
  });

  describe("US-2.3 — Manage semester rows", () => {
    it("semester rows show edit and delete actions", async () => {
      await mountSemesters([semester("SP2026", "2026-01-12", "2026-05-08")]);

      const row = wrapper.findAll("tbody tr").find((node) => node.text().includes("SP2026"));
      expect(row.find('[aria-label="Open semester"]').exists()).toBe(true);
      expect(row.find('[aria-label="Delete semester"]').exists()).toBe(true);
    });
  });

  describe("US-2.4 — Edit and delete semesters", () => {
    it("Admin edits a semester", async () => {
      await mountSemesters([semester("SP2026", "2026-01-12", "2026-05-08")]);
      semesterServices.updateSemester.mockResolvedValue({ data: {} });
      semesterServices.getSemesters.mockResolvedValue({
        data: [semester("FA2027", "2026-08-18", "2027-04-28")],
      });

      const row = wrapper.findAll("tbody tr").find((node) => node.text().includes("SP2026"));
      await row.get('[aria-label="Open semester"]').trigger("click");
      await flushPromises();
      await setSemesterId("FA2027");
      await setDates("2026-08-18", "2027-04-28");
      await clickButton("Update");

      expect(semesterServices.updateSemester).toHaveBeenCalledWith("SP2026", {
        semesterId: "FA2027",
        startDate: new Date("2026-08-18").toISOString(),
        endDate: new Date("2027-04-28").toISOString(),
      });
      expect(wrapper.text()).toContain("FA2027");
      expect(wrapper.text()).not.toContain("SP2026");
    });

    it("Admin deletes a semester", async () => {
      await mountSemesters([semester("SP2026", "2026-01-12", "2026-05-08")]);
      semesterServices.deleteSemester.mockResolvedValue({ data: {} });
      semesterServices.getSemesters.mockResolvedValue({ data: [] });

      const row = wrapper.findAll("tbody tr").find((node) => node.text().includes("SP2026"));
      await row.get('[aria-label="Delete semester"]').trigger("click");
      await flushPromises();
      await clickButton("Delete");

      expect(semesterServices.deleteSemester).toHaveBeenCalledWith("SP2026");
      expect(wrapper.text()).not.toContain("SP2026");
      expect(wrapper.text()).toContain("No semesters yet. Create your first semester.");
    });
  });

  describe("US-2.5 — Search Semesters", () => {
    const searchCatalog = [
      semester("SP2026", "2026-01-12", "2026-05-08"),
      semester("FA2026", "2026-08-16", "2026-12-06"),
      semester("SP2027", "2027-01-11", "2027-05-07"),
      semester("FA2027", "2027-08-16", "2027-12-10"),
    ];

    it("Search bar appears with semesters", async () => {
      await mountSemesters([semester("SP2026", "2026-01-12", "2026-05-08")]);

      const find = wrapper
        .findAllComponents({ name: "VTextField" })
        .find((node) => node.props("label") === "Find");
      expect(find.exists()).toBe(true);
    });

    it("No search bar appears with no semesters", async () => {
      await mountSemesters();

      const find = wrapper
        .findAllComponents({ name: "VTextField" })
        .filter((node) => node.props("label") === "Find");
      expect(wrapper.text()).toContain("No semesters yet. Create your first semester.");
      expect(find).toHaveLength(0);
    });

    it("Admin types in semester search bar", async () => {
      await mountSemesters(searchCatalog);
      const find = wrapper
        .findAllComponents({ name: "VTextField" })
        .find((node) => node.props("label") === "Find");
      await find.setValue("SP20");

      expect(rowIds(wrapper).sort()).toEqual(["SP2026", "SP2027"]);
    });

    it("Admin types in semester search bar 2", async () => {
      await mountSemesters(searchCatalog);
      const find = wrapper
        .findAllComponents({ name: "VTextField" })
        .find((node) => node.props("label") === "Find");
      await find.setValue("2027");

      expect(rowIds(wrapper).sort()).toEqual(["FA2027", "SP2027"]);
    });
  });
});
