import apiClient from "./services.js";

const courseServices = {
  getCourses() {
    return apiClient.get("courses");
  },

  createCourse(course) {
    return apiClient.post("courses", course);
  },

  updateCourse(courseId, course) {
    return apiClient.put(`courses/${courseId}`, course);
  },

  deleteCourse(courseId) {
    return apiClient.delete(`courses/${courseId}`);
  },

  getSections(courseId) {
    return apiClient.get(`courses/${courseId}/sections`);
  },

  createSection(courseId, section) {
    return apiClient.post(`courses/${courseId}/sections`, section);
  },

  updateSection(courseId, sectionId, section) {
    return apiClient.put(`courses/${courseId}/sections/${sectionId}`, section);
  },

  deleteSection(courseId, sectionId) {
    return apiClient.delete(`courses/${courseId}/sections/${sectionId}`);
  },
};

export default courseServices;
