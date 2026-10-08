import apiClient from "./services.js";

const facultyServices = {
  getFaculty() {
    return apiClient.get(`faculty`);
  },

  getOneFaculty(facultyId) {
    return apiClient.get(`faculty/${facultyId}`);
  },

  createSeason(season) {
    return apiClient.post("seasons", season);
  },

  updateSeason(seasonId, season) {
    return apiClient.put(`seasons/${seasonId}`, season);
  },

  deleteSeason(seasonId) {
    return apiClient.delete(`seasons/${seasonId}`);
  },

  createGames(seasonId) {
    return apiClient.post(`seasons/${seasonId}/games`);
  },
};

export default facultyServices;
