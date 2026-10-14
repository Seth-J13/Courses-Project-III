/**
 * Feature 6 — Enrollment Management
 * Spec: features/feature-6-enrollment-management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import EnrollmentList from "../src/views/EnrollmentList.vue";
import enrollmentServices from "../src/services/enrollmentServices.js";
import semesterServices from "../src/services/semesterServices_temp.js";
import courseServices from "../src/services/courseServices_temp.js";
import sectionServices from "../src/services/sectionServices_temp.js";
import Utils from "../src/config/utils.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/enrollmentServices.js", () => ({
  default: {
    getEnrollments: vi.fn(),
    getEnrollmentsBySemester: vi.fn(),
    createEnrollment: vi.fn(),
    deleteEnrollment: vi.fn(),
    getEnrollmentDetails: vi.fn(),
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

const seasonList = ["SP", "SU", "FA", "WI"];

const currentSemester = () => {
  const now = new Date();
  return seasonList[Math.floor(now.getMonth() / 4)] + now.getFullYear();
};

const nextSemester = (semester) => {
  const season = semester.slice(0, 2);
  let year = Number(semester.slice(2));
  const index = seasonList.indexOf(season);
  if (index === 3) year += 1;
  return (index === 3 ? seasonList[0] : seasonList[index + 1]) + year;
};

const prevSemester = (semester) => {
  const season = semester.slice(0, 2);
  let year = Number(semester.slice(2));
  const index = seasonList.indexOf(season);
  if (index === 0) year -= 1;
  return (index === 0 ? seasonList[3] : seasonList[index - 1]) + year;
};

const enrollment = (sectionId, courseName, semesterId = "FA2026") => ({
  universityId: student.id,
  semesterId,
  sectionId,
  section: {
    sectionId,
    courseId: sectionId.slice(0, 9),
    dayOfWeek: "MWF",
    timeStart: "09:00:00",
    timeEnd: "10:15:00",
    roomNum: "HSH 212",
    facultyId: 1112233,
    course: { courseId: sectionId.slice(0, 9), courseName },
    faculty: { facultyId: 1112233, fName: "Grace", lName: "Hopper" },
  },
});

const programming = enrollment("CMSC-1113-01", "Programming I");
const programmingTwo = enrollment("CMSC-2213-01", "Programming II");
const writing = enrollment("ENGL-5243-02", "Writing", "SP2027");

const clickButton = async (label) => {
  const button = [...document.body.querySelectorAll("button")].find((node) =>
    node.textContent.includes(label)
  );
  button.click();
  await flushPromises();
};

describe("Feature 6 — Enrollment Management", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.history.replaceState({}, "", "/");
    enrollmentServices.getEnrollments.mockResolvedValue({ data: [] });
    enrollmentServices.getEnrollmentsBySemester.mockResolvedValue({ data: [] });
    enrollmentServices.createEnrollment.mockResolvedValue({ data: {} });
    enrollmentServices.deleteEnrollment.mockResolvedValue({ status: 204 });
    semesterServices.getSemesters.mockResolvedValue({
      data: [
        { semesterId: "FA2025" },
        { semesterId: "WI2025" },
        { semesterId: "SP2026" },
        { semesterId: "SU2026" },
        { semesterId: "FA2026" },
        { semesterId: "WI2026" },
        { semesterId: "SP2027" },
        { semesterId: "SU2027" },
        { semesterId: "FA2027" },
      ],
    });
    courseServices.getCourses.mockResolvedValue({
      data: [
        { courseId: "CMSC-1113", courseName: "Programming I", semesterOffered: "FA" },
        { courseId: "ENGL-5243", courseName: "Writing", semesterOffered: "SP" },
      ],
    });
    courseServices.getCourse.mockResolvedValue({
      data: { courseId: "CMSC-1113", description: "Intro" },
    });
    sectionServices.getSections.mockResolvedValue({
      data: [
        {
          sectionId: "CMSC-1113-01",
          timeStart: "09:00:00",
          timeEnd: "10:15:00",
          dayOfWeek: "MWF",
          roomNum: "HSH 212",
          facultyId: 1112233,
        },
      ],
    });
    sectionServices.getSectionDetails.mockResolvedValue({
      data: {
        sectionId: "CMSC-1113-01",
        dayOfWeek: "MWF",
        timeStart: "09:00:00",
        timeEnd: "10:15:00",
        roomNum: "HSH 212",
        facultyId: 1112233,
      },
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  const mountList = async (rows) => {
    Utils.setStore("user", student);
    if (rows) {
      enrollmentServices.getEnrollmentsBySemester.mockResolvedValue({ data: rows });
    }
    ({ wrapper } = await mountWithPlugins(EnrollmentList, { attachTo: document.body }));
    await flushPromises();
  };

  const courseBox = () =>
    wrapper.findAllComponents({ name: "VCombobox" }).find((node) => node.props("label") === "Course");

  describe("US-6.1 — View Current Enrollments", () => {
    it("view enrollment list with no enrollments", async () => {
      await mountList();

      expect(wrapper.text()).toContain("No enrollments yet. Create your first enrollment.");
      expect(wrapper.find("tbody tr").exists()).toBe(false);
    });

    it("view enrollment list with enrollments", async () => {
      await mountList([programming]);

      expect(wrapper.text()).toContain("CMSC-1113-01");
      expect(wrapper.find('[aria-label="Delete enrollment"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Prev");
      expect(wrapper.text()).toContain("Next");
    });

    it("view only enrollments matching semesterId", async () => {
      enrollmentServices.getEnrollmentsBySemester.mockImplementation(async (_id, semesterId) => ({
        data: [programming, programmingTwo, writing].filter((row) => row.semesterId === semesterId),
      }));
      await mountList();

      expect(wrapper.text()).toContain(`Enrollments - ${currentSemester()}`);
      if (currentSemester() === "FA2026") {
        expect(wrapper.text()).toContain("CMSC-1113-01");
        expect(wrapper.text()).toContain("CMSC-2213-01");
        expect(wrapper.text()).not.toContain("ENGL-5243-02");
      }
    });

    it("student cannot fetch another user's enrollments", async () => {
      await mountList([programming]);

      const ids = enrollmentServices.getEnrollmentsBySemester.mock.calls.map((call) => call[0]);
      expect(ids).toEqual([student.id]);
      expect(ids).not.toContain(1027599);
    });
  });

  describe("US-6.2 — Enrollment Details", () => {
    it("view enrollment details", async () => {
      await mountList([programming]);

      const row = wrapper.find("tbody tr");
      expect(row.text()).toContain("CMSC-1113-01");
      expect(row.text()).toContain("Programming I");
      expect(row.text()).toContain("MWF");
      expect(row.text()).toContain("09:00AM");
      expect(row.text()).toContain("10:15AM");
      expect(row.text()).toContain("HSH 212");
      expect(row.text()).toContain("Grace Hopper");
    });
  });

  describe("US-6.3 — Add Enrollment", () => {
    const openAdd = async () => {
      await mountList();
      await clickButton("+ New enrollment");
    };

    it("Open add enrollment modal", async () => {
      await openAdd();

      expect(courseBox().exists()).toBe(true);
      expect(document.body.textContent).toContain("Cancel");
      expect(document.body.textContent).toContain("Enroll");
    });

    it("Use course combobox", async () => {
      await openAdd();
      await courseBox().setValue("CMSC");

      const items = courseBox().props("items");
      expect(items.some((item) => String(item).includes("CMSC-1113"))).toBe(true);
      expect(courseBox().props("modelValue")).toBe("CMSC");
    });

    it("Confirm course combobox", async () => {
      await openAdd();
      await courseBox().setValue("Programming I (CMSC-1113)");
      await flushPromises();

      const section = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((node) => node.props("label") === "Section");
      expect(section.exists()).toBe(true);
      expect(section.props("items").some((item) => String(item).includes("CMSC-1113-01"))).toBe(true);
    });

    it("Use section combobox", async () => {
      await openAdd();
      await courseBox().setValue("Programming I (CMSC-1113)");
      await flushPromises();
      const section = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((node) => node.props("label") === "Section");
      await section.setValue("CMSC");

      expect(section.props("items").some((item) => String(item).includes("CMSC-1113-01"))).toBe(true);
      expect(section.props("modelValue")).toBe("CMSC");
    });

    it("Confirm section combobox", async () => {
      await openAdd();
      await courseBox().setValue("Programming I (CMSC-1113)");
      await flushPromises();
      const section = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((node) => node.props("label") === "Section");
      await section.setValue("CMSC-1113-01: 09:00AM-10:15AM");
      await flushPromises();

      expect(document.body.textContent).toContain("Meeting Times:");
      expect(document.body.textContent).toContain("HSH 212");
      expect(document.body.textContent).toContain("1112233");
    });

    it("Create valid enrollment", async () => {
      await openAdd();
      enrollmentServices.getEnrollmentsBySemester.mockResolvedValue({ data: [programming] });
      await courseBox().setValue("Programming I (CMSC-1113)");
      await flushPromises();
      const section = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((node) => node.props("label") === "Section");
      await section.setValue("CMSC-1113-01: 09:00AM-10:15AM");
      await clickButton("Enroll");

      expect(enrollmentServices.createEnrollment).toHaveBeenCalledWith({
        universityId: student.id,
        semesterId: currentSemester(),
        sectionId: "CMSC-1113-01",
      });
      expect(wrapper.findAllComponents({ name: "VDialog" })[0].props("modelValue")).toBe(false);
      expect(wrapper.text()).toContain("CMSC-1113-01");
    });

    it("Create an enrollment with an empty course", async () => {
      await openAdd();
      await clickButton("Enroll");

      expect(enrollmentServices.createEnrollment).toHaveBeenCalledWith(
        expect.objectContaining({ sectionId: "" })
      );
    });

    it("Create an enrollment with an empty section", async () => {
      await openAdd();
      await courseBox().setValue("Programming I (CMSC-1113)");
      await flushPromises();
      await clickButton("Enroll");

      expect(enrollmentServices.createEnrollment).toHaveBeenCalledWith(
        expect.objectContaining({ sectionId: "" })
      );
    });

    it("Create an enrollment with duplicate data", async () => {
      await mountList([programming]);
      enrollmentServices.createEnrollment.mockRejectedValue({
        response: { data: { message: "Failed to create enrollment." } },
      });
      await clickButton("+ New enrollment");
      await courseBox().setValue("Programming I (CMSC-1113)");
      await flushPromises();
      const section = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((node) => node.props("label") === "Section");
      await section.setValue("CMSC-1113-01: 09:00AM-10:15AM");
      await clickButton("Enroll");

      expect(enrollmentServices.createEnrollment).toHaveBeenCalled();
      expect(document.body.textContent).toContain("Failed to create enrollment.");
      expect(wrapper.findAllComponents({ name: "VDialog" })[0].props("modelValue")).toBe(true);
    });

    it("Create enrollment with improper course ID", async () => {
      courseServices.getCourse.mockResolvedValue({ data: null });
      await openAdd();
      await courseBox().setValue("ZZZZ-9999");
      await flushPromises();

      const section = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((node) => node.props("label") === "Section");
      expect(section).toBeUndefined();
    });

    it("Create enrollment with improper section ID", async () => {
      sectionServices.getSectionDetails.mockResolvedValue({ data: null });
      await openAdd();
      await courseBox().setValue("Programming I (CMSC-1113)");
      await flushPromises();
      const section = wrapper
        .findAllComponents({ name: "VSelect" })
        .find((node) => node.props("label") === "Section");
      await section.setValue("XXXX-0000-99: 09:00AM-10:15AM");
      await flushPromises();

      expect(document.body.textContent).not.toContain("Meeting Times:");
      expect(enrollmentServices.createEnrollment).not.toHaveBeenCalled();
    });
  });

  describe("US-6.4 — Remove Enrollment", () => {
    it("Select enrollment delete icon", async () => {
      await mountList([programming]);
      await wrapper.get('[aria-label="Delete enrollment"]').trigger("click");
      await flushPromises();

      expect(document.body.textContent).toContain("Drop this class?");
      expect(document.body.textContent).toContain("Drop");
      expect(document.body.textContent).toContain("Cancel");
    });

    it("Confirm delete icon", async () => {
      enrollmentServices.getEnrollmentsBySemester
        .mockResolvedValueOnce({ data: [programming] })
        .mockResolvedValue({ data: [] });
      await mountList();
      await wrapper.get('[aria-label="Delete enrollment"]').trigger("click");
      await flushPromises();
      await clickButton("Drop");

      expect(enrollmentServices.deleteEnrollment).toHaveBeenCalledWith(
        student.id,
        programming.semesterId,
        "CMSC-1113-01"
      );
      expect(wrapper.text()).not.toContain("CMSC-1113-01");
      expect(wrapper.findAllComponents({ name: "VDialog" })[1].props("modelValue")).toBe(false);
    });

    it("Cancel delete", async () => {
      await mountList([programming]);
      await wrapper.get('[aria-label="Delete enrollment"]').trigger("click");
      await flushPromises();
      await clickButton("Cancel");

      expect(enrollmentServices.deleteEnrollment).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain("CMSC-1113-01");
      expect(wrapper.findAllComponents({ name: "VDialog" })[1].props("modelValue")).toBe(false);
    });
  });

  describe("US-6.5 — Seek semesters pagination", () => {
    it("EnrollmentList First Landing", async () => {
      enrollmentServices.getEnrollmentsBySemester.mockImplementation(async (_id, semesterId) => ({
        data: semesterId === currentSemester() ? [programming] : [writing],
      }));
      await mountList();

      expect(enrollmentServices.getEnrollmentsBySemester).toHaveBeenCalledWith(
        student.id,
        currentSemester()
      );
      expect(wrapper.text()).toContain("CMSC-1113-01");
      expect(wrapper.text()).not.toContain("ENGL-5243-02");
    });

    it("EnrollmentList Return Landing", async () => {
      Utils.setStore("lastSemChecked", "SP2027");
      enrollmentServices.getEnrollmentsBySemester.mockImplementation(async (_id, semesterId) => ({
        data: semesterId === "SP2027" ? [writing] : [programming],
      }));
      await mountList();

      expect(wrapper.text()).toContain("Enrollments - SP2027");
      expect(wrapper.text()).toContain("ENGL-5243-02");
    });

    it("Navigate Semesters order forward", async () => {
      await mountList([programming]);
      let semester = currentSemester();
      const seen = [];

      for (let step = 0; step < 4; step += 1) {
        await clickButton("Next");
        semester = nextSemester(semester);
        seen.push(semester);
      }

      expect(seen).toEqual(seen.map((value, index) => {
        let cursor = currentSemester();
        for (let i = 0; i <= index; i += 1) cursor = nextSemester(i === 0 ? currentSemester() : seen[i - 1]);
        return cursor;
      }));
      expect(wrapper.text()).toContain(`Enrollments - ${semester}`);
    });

    it("Navigate Semesters order backward", async () => {
      await mountList([programming]);
      let semester = currentSemester();

      for (let step = 0; step < 4; step += 1) {
        await clickButton("Prev");
        semester = prevSemester(semester);
      }

      expect(wrapper.text()).toContain(`Enrollments - ${semester}`);
    });

    it("Navigate Semesters combobox typing", async () => {
      await mountList([programming]);
      const semesterBox = wrapper
        .findAllComponents({ name: "VCombobox" })
        .find((node) => node.props("label") === "Find Semester");
      await semesterBox.setValue("FA");

      expect(semesterBox.props("items")).toEqual(
        expect.arrayContaining(["FA2025", "FA2026", "FA2027"])
      );
      expect(semesterBox.props("modelValue")).toBe("FA");
    });

    it("Navigate Semesters combobox select", async () => {
      enrollmentServices.getEnrollmentsBySemester.mockImplementation(async (_id, semesterId) => ({
        data: semesterId === "SP2027" ? [writing] : [programming],
      }));
      await mountList();
      const semesterBox = wrapper
        .findAllComponents({ name: "VCombobox" })
        .find((node) => node.props("label") === "Find Semester");
      await semesterBox.setValue("SP2027");
      await flushPromises();

      expect(wrapper.text()).toContain("Enrollments - SP2027");
      expect(wrapper.text()).toContain("ENGL-5243-02");

      await clickButton("Next");
      expect(wrapper.text()).toContain(`Enrollments - ${nextSemester("SP2027")}`);
    });
  });
});
