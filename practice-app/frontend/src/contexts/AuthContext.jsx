import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load user from localStorage on initial render
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // In a real app, this would be an API call to your backend
      if (email && password) {
        // Simulate successful login
        const userData = { email, name: email.split("@")[0] };
        localStorage.setItem("user", JSON.stringify(userData));
        setCurrentUser(userData);
        return userData;
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Register function
  const register = async (email, password, fullName, username, phone) => {
    try {
      // In a real app, this would be an API call to your backend
      if (email && password) {
        // Simulate successful registration
        const userData = {
          email,
          fullName,
          username,
          phone,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setCurrentUser(userData);
        return userData;
      } else {
        throw new Error("Invalid registration data");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      // In a real app, this would be an API call to your backend
      if (email) {
        // Simulate sending reset password email
        return { success: true, message: "Password reset email sent" };
      } else {
        throw new Error("Email is required");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (password, token) => {
    try {
      // In a real app, this would be an API call to your backend
      if (password && token) {
        // Simulate password reset
        return { success: true, message: "Password reset successful" };
      } else {
        throw new Error("Password and token are required");
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
