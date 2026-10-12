import apiClient from "./services.js";

const semesterServices = {
  getSemesters() {
    return apiClient.get("semesters");
  },

  createSemester(semester) {
    return apiClient.post("semesters", semester);
  },

  updateSemester(semesterId, semester) {
    return apiClient.put(`semesters/${semesterId}`, semester);
  },

  deleteSemester(semesterId) {
    return apiClient.delete(`semesters/${semesterId}`);
  },

  createSection(semesterId, semester) {
    return apiClient.post(`semesters/${semesterId}`, semester);
  },

  updateSection(semesterId, semester) {
    return apiClient.put(`semesters/${semesterId}`, semester);
  },

  deleteSection(semesterId, sectionId) {
    return apiClient.delete(`semesters/${semesterId}`);
  },
};

export default semesterServices;
