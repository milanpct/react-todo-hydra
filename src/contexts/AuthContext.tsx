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
    // Check for stored user session first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Initialize Hydra SDK for existing logged-in user
        initializeSDKForUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    // If no user is stored, don't initialize SDK yet - wait for login/signup
  }, []);

  // Helper function to initialize SDK for a user
  const initializeSDKForUser = (user: User) => {
    try {
      if (!hydraService.isInitialized()) {
        console.log("Initializing Hydra SDK for user:", user.email);

        // ✅ Fire-and-forget initialization (non-blocking)
        hydraService.initialize();

        // ✅ Fire-and-forget signin tracking (non-blocking)
        hydraService.trackUserSignin(
          user.id,
          user.firstName,
          user.lastName,
          user.email,
          user.phone
        );

        console.log(
          "✅ SDK initialization and signin tracking started (background processing)"
        );
      }
    } catch (error) {
      console.error("Hydra SDK initialization failed for user:", error);
      // Continue without SDK - app should still work
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await mockApi.login(email, password);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // ✅ Initialize Hydra SDK and track signin event (fire-and-forget)
      if (!hydraService.isInitialized()) {
        console.log(
          "Initializing Hydra SDK for login user:",
          loggedInUser.email
        );
        hydraService.initialize();
      }

      hydraService.trackUserSignin(
        loggedInUser.id,
        loggedInUser.firstName,
        loggedInUser.lastName,
        loggedInUser.email,
        loggedInUser.phone
      );

      console.log("✅ Login completed, analytics processing in background");
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

      // ✅ Initialize Hydra SDK and track signup event (fire-and-forget)
      if (!hydraService.isInitialized()) {
        console.log("Initializing Hydra SDK for signup user:", newUser.email);
        hydraService.initialize();
      }

      hydraService.trackUserSignup(newUser);

      console.log("✅ Signup completed, analytics processing in background");
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

        console.log("✅ Logout tracking started (background processing)");
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
