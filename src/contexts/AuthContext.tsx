import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType } from "../types";
import { mockApi } from "../services/mockApi";
import { hydraService } from "../services/hydraService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ INITIALIZE SDK FOR ANONYMOUS USERS IMMEDIATELY
    try {
      if (!hydraService.isInitialized()) {
        console.log("Initializing Hydra SDK for anonymous user");
        hydraService.initialize();
      }
    } catch (error) {
      console.error("Failed to initialize SDK for anonymous user:", error);
      // Continue without SDK - app should still work
    }

    // Check for stored user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Track signin for returning user (this will also identify the user)
        hydraService.trackUserSignin(
          parsedUser.id,
          parsedUser.firstName,
          parsedUser.lastName,
          parsedUser.email,
          parsedUser.phone
        );

        console.log("✅ Returning user identified:", parsedUser.email);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await mockApi.login(email, password);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // ✅ SDK already initialized - just identify user and track signin
      hydraService.trackUserSignin(
        loggedInUser.id,
        loggedInUser.firstName,
        loggedInUser.lastName,
        loggedInUser.email,
        loggedInUser.phone
      );

      console.log("✅ Login completed, user identified");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Omit<User, "id"> & { password: string }) => {
    setLoading(true);
    try {
      const newUser = await mockApi.signup(userData);
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      // ✅ SDK already initialized - just identify user and track signup
      hydraService.trackUserSignup(newUser);

      console.log("✅ Signup completed, user identified");
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (user) {
        // ✅ Track signout event with Hydra SDK (fire-and-forget)
        hydraService.trackUserSignout(user.id);
        hydraService.resetUserSession();

        console.log("✅ User logged out, continuing as anonymous");
      }

      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if tracking fails
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error("No user logged in");

    setLoading(true);
    try {
      const updatedUser = await mockApi.updateProfile(user.id, updates);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // ✅ Track update event with Hydra SDK (fire-and-forget)
      hydraService.trackUserUpdate({
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });

      console.log(
        "✅ Profile update completed, analytics processing in background"
      );
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
