import api from "./api";

export const getPatientHistory = (id) =>
  api.get(`/patient/${id}`);