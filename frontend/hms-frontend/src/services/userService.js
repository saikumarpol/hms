
import api from "./api";

export const getUsers = async (filters = {}) => {
  const response = await api.get("/users", {
    params: filters,
  });

  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/users", userData);

  return response.data.data;
};
