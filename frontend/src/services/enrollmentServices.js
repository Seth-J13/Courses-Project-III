import apiClient from "./services.js";

const enrollmentServices = {
  getEnrollment(universityId) {
    return apiClient.get(`enrollments/${universityId}`);
  },

  createEnrollment(universityId) {
    return apiClient.post(`enrollments/${universityId}`);
  },

  getEnrollments(universityId, semesterId) {
    return apiClient.get(`enrollments/${universityId}/${semesterId}`);
  },

  getEnrollmentDetails(universityId, semesterId, sectionId) {
    return apiClient.get(`enrollments/${universityId}/${semesterId}/${sectionId}`);
  },

  deleteEnrollment(universityId, semesterId, sectionId) {
    return apiClient.delete(`enrollments/${universityId}/${semesterId}/${sectionId}`);
  },
};

export default enrollmentServices;
