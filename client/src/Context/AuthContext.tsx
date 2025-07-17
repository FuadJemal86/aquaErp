import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "@/services/api";

// Define types for the user and context
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  image?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch current user data from server on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/auth/me");
        const fetchedUser: User = response.data;
        setUser(fetchedUser);
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error(
          "Failed to fetch user data:",
          error.response?.data || error.message
        );
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
