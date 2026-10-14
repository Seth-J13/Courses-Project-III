/**
 * Feature 5 — Section Management
 * Spec: features/Feature-5-Section-Management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import SectionsList from "../src/views/SectionsList.vue";
import sectionServices from "../src/services/sectionServices.js";
import facultyServices from "../src/services/facultyServices.js";
import courseServices from "../src/services/courseServices.js";
import Utils from "../src/config/utils.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/sectionServices.js", () => ({
  default: {
    getSections: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
  },
}));

vi.mock("../src/services/facultyServices.js", () => ({
  default: {
    getFaculty: vi.fn(),
  },
}));

vi.mock("../src/services/courseServices.js", () => ({
  default: {
    getCourses: vi.fn(),
  },
}));

const adminUser = {
  id: 1,
  email: "admin@example.com",
  role: "admin",
  token: "admin-token",
};

const studentUser = {
  id: 2,
  email: "student@example.com",
  role: "student",
  token: "student-token",
};

const mondaySection = {
  sectionId: "CMSC-1111-01",
  courseId: "CMSC-1111",
  facultyId: 1112233,
  dayOfWeek: "Monday",
  roomNum: "HSH 212",
  timeStart: "09:00:00",
  timeEnd: "10:15:00",
};

const wednesdaySection = {
  ...mondaySection,
  sectionId: "CMSC-1111-02",
  facultyId: 1112234,
  dayOfWeek: "Wednesday",
  timeStart: "11:00:00",
  timeEnd: "12:15:00",
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

const textFields = (wrapper, label) =>
  wrapper
    .findAllComponents({ name: "VTextField" })
    .filter((node) => node.props("label") === label);

describe("Feature 5 — Section Management", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sectionServices.getSections.mockResolvedValue({ data: [] });
    facultyServices.getFaculty.mockResolvedValue({
      data: [{ facultyId: 1112233, fName: "Ada", lName: "Lovelace", department: "Computer Science" }],
    });
    courseServices.getCourses.mockResolvedValue({
      data: [{ courseId: "CMSC-1111" }],
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  const mountSections = async (user = adminUser) => {
    Utils.setStore("user", user);
    ({ wrapper } = await mountWithPlugins(SectionsList, { attachTo: document.body }));
    await flushPromises();
  };

  describe("US-5.1 — Add Section", () => {
    it("Admin creates a valid section", async () => {
      sectionServices.getSections
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValue({ data: [mondaySection] });
      sectionServices.createSection.mockResolvedValue({ data: mondaySection });
      await mountSections();

      await wrapper.get("button").trigger("click");
      await flushPromises();

      const course = wrapper
        .findAllComponents({ name: "VCombobox" })
        .find((node) => node.props("label") === "Course ID");
      await course.setValue("CMSC-1111");
      const sectionIds = textFields(wrapper, "Section ID");
      await sectionIds[sectionIds.length - 1].setValue("CMSC-1111-01");
      const faculty = wrapper
        .findAllComponents({ name: "VCombobox" })
        .find((node) => node.props("label") === "Faculty ID");
      await faculty.setValue("Ada Lovelace (1112233)");
      const day = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((node) => node.props("label") === "Day of Week");
      await day.setValue(["M"]);
      const rooms = textFields(wrapper, "Room Number");
      await rooms[rooms.length - 1].setValue("HSH 212");
      const starts = textFields(wrapper, "Start Time");
      await starts[starts.length - 1].setValue("09:00:00");
      const ends = textFields(wrapper, "End Time");
      await ends[ends.length - 1].setValue("10:15:00");
      await clickInDialog("Add Section", "Save");

      expect(sectionServices.createSection).toHaveBeenCalledWith({
        courseId: "CMSC-1111",
        sectionId: "CMSC-1111-01",
        facultyId: "1112233",
        dayOfWeek: "M",
        roomNum: "HSH 212",
        timeStart: "09:00:00",
        timeEnd: "10:15:00",
      });
      expect(wrapper.text()).toContain("CMSC-1111-01");
    });
  });

  describe("US-5.2 — Edit Section", () => {
    it("Admin updates a section", async () => {
      const existing = { ...mondaySection, roomNum: "NSW 201" };
      sectionServices.getSections
        .mockResolvedValueOnce({ data: [existing] })
        .mockResolvedValue({ data: [{ ...existing, roomNum: "NSW 202" }] });
      sectionServices.updateSection.mockResolvedValue({ data: {} });
      await mountSections();

      await wrapper.get('[aria-label="Edit section"]').trigger("click");
      await flushPromises();
      const rooms = textFields(wrapper, "Room Number");
      await rooms[rooms.length - 1].setValue("NSW 202");
      await clickInDialog("Edit Section", "Save");

      expect(sectionServices.updateSection).toHaveBeenCalledWith(
        "CMSC-1111-01",
        expect.objectContaining({ roomNum: "NSW 202", sectionId: "CMSC-1111-01" })
      );
      expect(wrapper.text()).toContain("NSW 202");
      expect(wrapper.text()).toContain("CMSC-1111-01");
    });
  });

  describe("US-5.3 — Remove Section", () => {
    it("Admin deletes a section", async () => {
      sectionServices.getSections
        .mockResolvedValueOnce({ data: [mondaySection] })
        .mockResolvedValue({ data: [] });
      sectionServices.deleteSection.mockResolvedValue({ data: { message: "Section deleted." } });
      await mountSections();

      await wrapper.get('[aria-label="Delete section"]').trigger("click");
      await flushPromises();

      expect(sectionServices.deleteSection).toHaveBeenCalledWith("CMSC-1111-01");
      expect(wrapper.text()).not.toContain("CMSC-1111-01");
    });
  });

  describe("US-5.4 — List & Filter Sections", () => {
    it("Admin sees course, faculty, time, and room", async () => {
      sectionServices.getSections.mockResolvedValue({ data: [mondaySection] });
      await mountSections();

      const row = wrapper.find("tbody tr");
      expect(row.text()).toContain("CMSC-1111");
      expect(row.text()).toContain("1112233");
      expect(row.text()).toContain("HSH 212");
      expect(row.text()).toContain("09:00:00");
      expect(row.text()).toContain("10:15:00");
    });

    it("Filter sections", async () => {
      sectionServices.getSections.mockImplementation((filters) => {
        const rows = [mondaySection, wednesdaySection];
        const data = filters?.dayOfWeek
          ? rows.filter((section) => section.dayOfWeek === filters.dayOfWeek)
          : rows;
        return Promise.resolve({ data });
      });
      await mountSections();

      await textFields(wrapper, "Day of Week")[0].setValue("Monday");
      const apply = [...document.body.querySelectorAll("button")].find((node) =>
        node.textContent.includes("Apply Filters")
      );
      apply.click();
      await flushPromises();

      expect(wrapper.text()).toContain("CMSC-1111-01");
      expect(wrapper.text()).not.toContain("CMSC-1111-02");
    });

    it("Student cannot access section management", async () => {
      await mountSections(studentUser);

      expect(wrapper.text()).toContain("Access denied");
      expect(sectionServices.getSections).not.toHaveBeenCalled();
    });
  });
});
