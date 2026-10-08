import apiClient from "./services.js";

const courseServices = {
  getCourses() {
    return apiClient.get("courses");
  },

  getCourse(courseId) {
    return apiClient.get(`courses/${courseId}`, courseId)
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

export default courseServices;
