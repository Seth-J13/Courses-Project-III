/**
 * Feature 4 — Faculty Management
 * Spec: features/feature-4-faculty-management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Faculty from "../src/views/Faculty.vue";
import facultyServices from "../src/services/facultyServices.js";
import Utils from "../src/config/utils.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/facultyServices.js", () => ({
  default: {
    getFaculty: vi.fn(),
    createFaculty: vi.fn(),
    updateFaculty: vi.fn(),
    deleteFaculty: vi.fn(),
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

const ada = {
  facultyId: 1,
  fName: "Ada",
  lName: "Lovelace",
  department: "Computer Science",
};

const grace = {
  facultyId: 2,
  fName: "Grace",
  lName: "Hopper",
  department: "Computing",
};

const longValue = "x".repeat(226);

const clickLastButton = async (label) => {
  const buttons = [...document.body.querySelectorAll("button")].filter((node) =>
    node.textContent.includes(label)
  );
  buttons[buttons.length - 1].click();
  await flushPromises();
};

const clickInDialog = async (title, label) => {
  const card = [...document.body.querySelectorAll(".v-card")].find((node) =>
    node.querySelector(".v-card-title")?.textContent.includes(title)
  );
  const button = [...card.querySelectorAll("button")].find((node) =>
    node.textContent.includes(label)
  );
  button.click();
  await flushPromises();
};

describe("Feature 4 — Faculty Management", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    facultyServices.getFaculty.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  const mountFaculty = async (rows = []) => {
    Utils.setStore("user", adminUser);
    facultyServices.getFaculty.mockResolvedValue({ data: rows });
    ({ wrapper } = await mountWithPlugins(Faculty, { attachTo: document.body }));
    await flushPromises();
  };

  const fields = (label) =>
    wrapper
      .findAllComponents({ name: "VTextField" })
      .filter((node) => node.props("label") === label);

  const field = (label) => fields(label)[0];

  const setAll = async (label, value) => {
    for (const match of fields(label)) {
      await match.setValue(value);
    }
  };

  const dialogOpen = (index) =>
    wrapper.findAllComponents({ name: "VDialog" })[index].props("modelValue");

  const rowFor = (name) =>
    wrapper.findAll("tbody tr").find((node) => node.text().includes(name));

  describe("US-4.1 — Add Faculty", () => {
    it("Admin clicks the add faculty button", async () => {
      await mountFaculty();
      const gets = facultyServices.getFaculty.mock.calls.length;

      await clickLastButton("Add Faculty");

      expect(dialogOpen(0)).toBe(true);
      expect(document.body.textContent).toContain("Add Faculty");
      expect(facultyServices.getFaculty.mock.calls.length).toBe(gets);
      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
    });

    it("Admin inputs faculty first name with correct values", async () => {
      await mountFaculty();
      await clickLastButton("Add Faculty");
      await field("First Name").setValue("Ada");

      expect(field("First Name").props("modelValue")).toBe("Ada");
      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
    });

    it("Admin inputs faculty first name with incorrect values", async () => {
      await mountFaculty();
      await clickLastButton("Add Faculty");
      await field("First Name").setValue(longValue);

      expect(field("First Name").props("modelValue")).toBe(longValue);
      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
    });

    it("Admin inputs faculty last name with correct values", async () => {
      await mountFaculty();
      await clickLastButton("Add Faculty");
      await field("Last Name").setValue("Lovelace");

      expect(field("Last Name").props("modelValue")).toBe("Lovelace");
      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
    });

    it("Admin inputs faculty last name with incorrect values", async () => {
      await mountFaculty();
      await clickLastButton("Add Faculty");
      await field("Last Name").setValue(longValue);

      expect(field("Last Name").props("modelValue")).toBe(longValue);
      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
    });

    it("Admin inputs faculty department with correct values", async () => {
      await mountFaculty();
      await clickLastButton("Add Faculty");
      await field("Department").setValue("Computer Science");

      expect(field("Department").props("modelValue")).toBe("Computer Science");
      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
    });

    it("Admin inputs faculty department with incorrect values", async () => {
      await mountFaculty();
      await clickLastButton("Add Faculty");
      await field("Department").setValue(longValue);

      expect(field("Department").props("modelValue")).toBe(longValue);
      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
    });

    it("Admin clicks the `Add Faculty` button with correct inputted values", async () => {
      await mountFaculty();
      facultyServices.createFaculty.mockResolvedValue({ data: "Successfully created new faculty" });
      facultyServices.getFaculty.mockResolvedValue({ data: [ada] });

      await clickLastButton("Add Faculty");
      await setAll("First Name", "Ada");
      await setAll("Last Name", "Lovelace");
      await setAll("Department", "Computer Science");
      await clickInDialog("Add Faculty", "Add Faculty");

      expect(facultyServices.createFaculty).toHaveBeenCalledWith({
        fName: "Ada",
        lName: "Lovelace",
        department: "Computer Science",
      });
      expect(dialogOpen(0)).toBe(false);
      expect(wrapper.text()).toContain("Ada");
      expect(wrapper.text()).toContain("Lovelace");
    });

    it("Admin clicks the `Add Faculty` button with incorrect inputted values", async () => {
      await mountFaculty();
      await clickLastButton("Add Faculty");
      await field("First Name").setValue("");
      await field("Last Name").setValue("Lovelace");
      await field("Department").setValue("Computer Science");
      await clickLastButton("Add Faculty");

      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
      expect(dialogOpen(0)).toBe(true);
    });

    it("Admin clicks the `Cancel` button", async () => {
      await mountFaculty();
      await clickLastButton("Add Faculty");
      await field("First Name").setValue("Ada");
      await clickLastButton("Cancel");

      expect(dialogOpen(0)).toBe(false);
      expect(facultyServices.createFaculty).not.toHaveBeenCalled();
    });
  });

  describe("US-4.2 — Edit Faculty", () => {
    const openEdit = async () => {
      await mountFaculty([ada]);
      await rowFor("Lovelace").findAllComponents({ name: "VIcon" })[0].trigger("click");
      await flushPromises();
    };

    it("Admin clicks the `Edit` icon button on a faculty record", async () => {
      await openEdit();

      expect(dialogOpen(1)).toBe(true);
      expect(field("First Name").props("modelValue")).toBe("Ada");
      expect(field("Last Name").props("modelValue")).toBe("Lovelace");
      expect(field("Department").props("modelValue")).toBe("Computer Science");
      expect(facultyServices.updateFaculty).not.toHaveBeenCalled();
    });

    it("Admin edits the faculty's `first name` text input", async () => {
      await openEdit();
      await field("First Name").setValue("Grace");

      expect(field("First Name").props("modelValue")).toBe("Grace");
      expect(facultyServices.updateFaculty).not.toHaveBeenCalled();
    });

    it("Admin edits the faculty's `last name` text input", async () => {
      await openEdit();
      await field("Last Name").setValue("Hopper");

      expect(field("Last Name").props("modelValue")).toBe("Hopper");
      expect(facultyServices.updateFaculty).not.toHaveBeenCalled();
    });

    it("Admin edits the faculty's `department` text input", async () => {
      await openEdit();
      await field("Department").setValue("Computing");

      expect(field("Department").props("modelValue")).toBe("Computing");
      expect(facultyServices.updateFaculty).not.toHaveBeenCalled();
    });

    it("Admin clicks the `Update Faculty` button with correct inputted values", async () => {
      await openEdit();
      facultyServices.updateFaculty.mockResolvedValue({ data: grace });
      facultyServices.getFaculty.mockResolvedValue({ data: [grace] });
      await field("First Name").setValue("Grace");
      await field("Last Name").setValue("Hopper");
      await field("Department").setValue("Computing");
      await clickLastButton("Update Faculty");

      expect(facultyServices.updateFaculty).toHaveBeenCalledWith(1, expect.objectContaining({
        fName: "Grace",
        lName: "Hopper",
        department: "Computing",
      }));
      expect(dialogOpen(1)).toBe(false);
      expect(wrapper.text()).toContain("Grace");
      expect(wrapper.text()).toContain("Hopper");
    });

    it("Admin clicks the `Update Faculty` button with incorrect inputted values", async () => {
      await openEdit();
      facultyServices.updateFaculty.mockRejectedValue({
        response: { data: { message: "First name is required." } },
      });
      await field("First Name").setValue("");
      await clickLastButton("Update Faculty");

      expect(facultyServices.updateFaculty).toHaveBeenCalled();
      expect(dialogOpen(1)).toBe(true);
      expect(document.body.textContent).toContain("First name is required.");
    });

    it("Admin clicks the `Cancel` button", async () => {
      await openEdit();
      await field("First Name").setValue("Grace");
      await clickLastButton("Cancel");

      expect(dialogOpen(1)).toBe(false);
      expect(facultyServices.updateFaculty).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("Ada");
    });
  });

  describe("US-4.3 — Delete Faculty", () => {
    it("Admin clicks the `Delete` icon button and deletes the user successfully", async () => {
      await mountFaculty([ada]);
      facultyServices.deleteFaculty.mockResolvedValue({
        data: { message: "Successfully deleted 1" },
      });
      facultyServices.getFaculty.mockResolvedValue({ data: [] });

      await rowFor("Lovelace").findAllComponents({ name: "VIcon" })[1].trigger("click");
      await flushPromises();
      await clickLastButton("Remove Faculty");

      expect(facultyServices.deleteFaculty).toHaveBeenCalledWith(1);
      expect(wrapper.text()).not.toContain("Lovelace");
    });

    it("Admin clicks the `Delete` icon button and deletes the user unsuccessfully", async () => {
      await mountFaculty([ada]);
      facultyServices.deleteFaculty.mockRejectedValue({
        response: { data: { message: "Failed to delete faculty." } },
      });

      await rowFor("Lovelace").findAllComponents({ name: "VIcon" })[1].trigger("click");
      await flushPromises();
      await clickLastButton("Remove Faculty");

      expect(facultyServices.deleteFaculty).toHaveBeenCalledWith(1);
      expect(wrapper.text()).toContain("Lovelace");
      expect(dialogOpen(2)).toBe(true);
    });
  });

  describe("US-4.4 — List Faculty", () => {
    it("Admin opens the faculty page successfully", async () => {
      await mountFaculty([grace, ada]);

      expect(facultyServices.getFaculty).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Grace");
      expect(wrapper.text()).toContain("Hopper");
      expect(wrapper.text()).toContain("Computing");
      expect(wrapper.text()).toContain("Ada");
      expect(wrapper.text()).toContain("Lovelace");
      expect(wrapper.findAllComponents({ name: "VIcon" }).length).toBeGreaterThanOrEqual(4);
    });

    it("Admin opens the faculty page unsuccessfully", async () => {
      Utils.setStore("user", adminUser);
      facultyServices.getFaculty.mockRejectedValue({
        response: { data: { message: "Failed to fetch faculty." } },
      });
      ({ wrapper } = await mountWithPlugins(Faculty, { attachTo: document.body }));
      await flushPromises();

      expect(wrapper.findAll("tbody tr")).toHaveLength(0);
    });

    it("Admin `Adds/Edits` a faculty", async () => {
      await mountFaculty([ada]);
      facultyServices.createFaculty.mockResolvedValue({ data: "Successfully created new faculty" });
      facultyServices.getFaculty.mockResolvedValue({ data: [ada, grace] });

      await clickLastButton("Add Faculty");
      await setAll("First Name", "Grace");
      await setAll("Last Name", "Hopper");
      await setAll("Department", "Computing");
      await clickInDialog("Add Faculty", "Add Faculty");

      expect(facultyServices.getFaculty.mock.calls.length).toBeGreaterThan(1);
      expect(wrapper.text()).toContain("Ada");
      expect(wrapper.text()).toContain("Grace");
      expect(wrapper.findAllComponents({ name: "VIcon" }).length).toBeGreaterThanOrEqual(4);
    });
  });
});
