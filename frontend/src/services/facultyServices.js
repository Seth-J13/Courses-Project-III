import apiClient from "./services.js";

const facultyServices = {
  getFaculty() {
    return apiClient.get("faculty");
  },

  createPerson(faculty) {
    return apiClient.post("faculty", faculty);
  },

  updatePerson(facultyId, faculty) {
    return apiClient.put(`faculty/${facultyId}`, faculty);
  },

  deletePerson(facultyId) {
    return apiClient.delete(`faculty/${facultyId}`);
  },
};

export default facultyServices;
