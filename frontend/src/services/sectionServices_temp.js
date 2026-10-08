import apiClient from "./services.js";

const sectionServices = {
  getSections(courseId) {
    return apiClient.get(`sections/${courseId}`, courseId);
  },

  getSectionDetails(sectionId) {
    return apiClient.get(`sections/one/${sectionId}`, sectionId);
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

export default sectionServices;
