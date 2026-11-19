
import api from "./api";

export const getConsultations = async (filters = {}) => {
  const response = await api.get("/consultations", {
    params: filters,
  });
  return response.data.data;
};

export const getConsultationById = async (id) => {
  const response = await api.get(`/consultations/${id}`);
  return response.data.data;
};

export const getConsultationByAppointment = async (appointmentId) => {
  const response = await api.get(
    `/consultations/appointment/${appointmentId}`
  );
  return response.data.data;
};

export const createConsultation = async (data) => {
  const response = await api.post("/consultations", data);
  return response.data.data;
};

export const updateConsultation = async (id, data) => {
  const response = await api.patch(`/consultations/${id}`, data);
  return response.data.data;
};

export const completeConsultation = async (id) => {
  const response = await api.patch(`/consultations/${id}/complete`);
  return response.data.data;
};
