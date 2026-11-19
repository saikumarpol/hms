
import api from "./api";

export const getLabTests = async (filters = {}) => {
  const response = await api.get("/laboratory/tests", {
    params: filters,
  });

  return response.data.data;
};

export const createLabTest = async (data) => {
  const response = await api.post("/laboratory/tests", data);
  return response.data.data;
};

export const updateLabTest = async (id, data) => {
  const response = await api.patch(`/laboratory/tests/${id}`, data);
  return response.data.data;
};

export const getLabOrders = async (filters = {}) => {
  const response = await api.get("/laboratory/orders", {
    params: filters,
  });

  return response.data.data;
};

export const getLabOrderById = async (id) => {
  const response = await api.get(`/laboratory/orders/${id}`);
  return response.data.data;
};

export const createLabOrder = async (data) => {
  const response = await api.post("/laboratory/orders", data);
  return response.data.data;
};

export const collectLabSample = async (id) => {
  const response = await api.patch(`/laboratory/orders/${id}/collect`, {});
  return response.data.data;
};

export const updateLabResults = async (id, data) => {
  const response = await api.patch(
    `/laboratory/orders/${id}/results`,
    data
  );

  return response.data.data;
};

export const completeLabOrder = async (id) => {
  const response = await api.patch(`/laboratory/orders/${id}/complete`, {});
  return response.data.data;
};

export const cancelLabOrder = async (id) => {
  const response = await api.patch(`/laboratory/orders/${id}/cancel`, {});
  return response.data.data;
};
