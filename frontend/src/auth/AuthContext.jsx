// frontend/src/auth/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// --- FIX: Define the API base URL using the environment variable ---
// It includes a fallback to 'http://localhost:3000' for safety.
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (token) {
        const decodedUser = jwtDecode(token);
        setUser({ ...decodedUser, role: decodedUser.role || "user" });
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      setToken(null);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      // --- FIX: Use the API_URL variable for the fetch request ---
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Login failed");
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem("authToken", data.token);
      const decodedUser = jwtDecode(data.token);
      setUser({ ...decodedUser, role: decodedUser.role || "user" });
      return { user: decodedUser };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const authContextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
