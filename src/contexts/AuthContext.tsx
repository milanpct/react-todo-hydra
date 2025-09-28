import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { mockApi } from '../services/mockApi';
import { hydraService } from '../services/hydraService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Initialize Hydra SDK for existing logged-in user
        initializeSDKForUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    // If no user is stored, don't initialize SDK yet - wait for login/signup
  }, []);

  // Helper function to initialize SDK for a user
  const initializeSDKForUser = async (user: User) => {
    try {
      if (!hydraService.isInitialized()) {
        console.log('Initializing Hydra SDK for user:', user.email);
        await hydraService.initialize();
        
        // Track that this user session has started (for already logged-in users)
        await hydraService.trackUserSignin(
          user.id,
          user.firstName,
          user.lastName,
          user.email,
          user.phone
        );
      }
    } catch (error) {
      console.error('Hydra SDK initialization failed for user:', error);
      // Continue without SDK - app should still work
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await mockApi.login(email, password);
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      // Initialize Hydra SDK and track signin event
      try {
        if (!hydraService.isInitialized()) {
          console.log('Initializing Hydra SDK for login user:', loggedInUser.email);
          await hydraService.initialize();
        }
        
        await hydraService.trackUserSignin(
          loggedInUser.id,
          loggedInUser.firstName,
          loggedInUser.lastName,
          loggedInUser.email,
          loggedInUser.phone
        );
        
      } catch (error) {
        console.error('Failed to initialize SDK or track signin event:', error);
        // Continue without tracking - login should still work
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }) => {
    setLoading(true);
    try {
      const newUser = await mockApi.signup(userData);
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Initialize Hydra SDK and track signup event
      try {
        if (!hydraService.isInitialized()) {
          console.log('Initializing Hydra SDK for signup user:', newUser.email);
          await hydraService.initialize();
        }
        
        await hydraService.trackUserSignup(newUser);
      } catch (error) {
        console.error('Failed to initialize SDK or track signup event:', error);
        // Continue without tracking - signup should still work
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (user) {
        // Track signout event with Hydra SDK
        try {
          await hydraService.trackUserSignout(user.id);
          hydraService.resetUserSession();
        } catch (error) {
          console.error('Failed to track signout event:', error);
          // Continue with logout even if tracking fails
        }
      }
      
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if tracking fails
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const updatedUser = await mockApi.updateProfile(user.id, updates);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Track update event with Hydra SDK
      try {
        await hydraService.trackUserUpdate({
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone
        });
      } catch (error) {
        console.error('Failed to track update event:', error);
        // Continue without tracking - update should still work
      }
    } catch (error) {
      console.error('Profile update failed:', error);
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
