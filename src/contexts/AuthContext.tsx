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
    // Initialize Hydra SDK on app start
    hydraService.initialize().catch(error => {
      console.error('Hydra SDK initialization failed:', error);
      // Continue without SDK - app should still work
    });
    
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await mockApi.login(email, password);
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      // Track signin event with Hydra SDK
      try {
        await hydraService.trackUserSignin(
          loggedInUser.id,
          loggedInUser.firstName,
          loggedInUser.lastName,
          loggedInUser.email,
          loggedInUser.phone
        );
        
      } catch (error) {
        console.error('Failed to track signin event:', error);
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
      
      // Track signup event with Hydra SDK
      try {
        await hydraService.trackUserSignup(newUser);
      } catch (error) {
        console.error('Failed to track signup event:', error);
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
