import { useCallback, useEffect, useState } from "react";
import api from "../api/api.js";
import { AuthContext } from "./auth-context.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");

    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get("/me");

          setUser(response.data.user);
        } catch (err) {
          console.error("Session expired or invalid token", err);
          logout();
        }
      }

      setLoading(false);
    };

    loadUser();
  }, [logout, token]);

  const login = async (email, password) => {
    const response = await api.post("/login", { email, password });

    const accessToken = response.data.accessToken;

    localStorage.setItem("accessToken", accessToken);

    setToken(accessToken);

    const profileResponse = await api.get("/me");
    setUser(profileResponse.data.user);

    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
