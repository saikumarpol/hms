
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hms_user")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const result = response.data?.data || response.data;

      const token =
        result.token ||
        result.accessToken ||
        result.jwt;

      const loggedInUser =
        result.user ||
        result;

      if (!token) {
        throw new Error(
          "Login succeeded but the API response did not contain a token. Check the login response format."
        );
      }

      localStorage.setItem("hms_token", token);
      localStorage.setItem(
        "hms_user",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);

      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
