import apiClient from "./services.js";

const enrollmentServices = {
  getEnrollments(universityId) {
    console.log("test")
    return apiClient.get(`enrollments/${universityId}`);
  },

  createEnrollment(body) {
    return apiClient.post(`enrollments/${body.universityId}`, body);
  },

  getEnrollmentsBySemester(universityId, semesterId) {
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
