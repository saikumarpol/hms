
import api from "./api";

export const getAppointments = async (filters = {}) => {
  const response = await api.get("/appointments", { params: filters });
  return response.data.data;
};

export const getPatientsForAppointment = async () => {
  const response = await api.get("/patients");
  return response.data.data;
};

export const getDoctorsForAppointment = async () => {
  const response = await api.get("/doctors");
  return response.data.data;
};

export const createAppointment = async (data) => {
  const response = await api.post("/appointments", data);
  return response.data.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const response = await api.patch(`/appointments/${id}/status`, { status });
  return response.data.data;
};
