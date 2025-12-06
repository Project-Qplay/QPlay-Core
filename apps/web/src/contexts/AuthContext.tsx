import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  last_login?: string;
  total_playtime: number;
  games_completed: number;
  best_completion_time?: number;
  total_score: number;
  quantum_mastery_level: number;
  preferences: Record<string, any>;
  auth_provider: 'google' | 'email';
}

interface SignUpData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signInWithGoogle: (credential: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('quantum-quest-token');
    if (token) {
      // Set token in API service
      apiService.setAuthToken(token);
      // Try to get current user
      getCurrentUser();
    } else {
      setInitializing(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // Token might be expired, clear it
      localStorage.removeItem('quantum-quest-token');
      apiService.setAuthToken(null);
    } finally {
      setInitializing(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.signIn(email, password);
      
      // Store token
      localStorage.setItem('quantum-quest-token', response.access_token);
      apiService.setAuthToken(response.access_token);
      
      // Set user
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      const response = await apiService.signUp(data);
      
      // Store token
      localStorage.setItem('quantum-quest-token', response.access_token);
      apiService.setAuthToken(response.access_token);
      
      // Set user
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

   // Function to handle sign-in via Google OAuth credential
 // Handles sending credential to Netlify Functions
const signInWithGoogle = async (credential: string) => {
  setLoading(true); // Set loading state to show spinner or disable UI during the request

  try {
    // Send the credential (JWT from Google) to Netlify Functions for verification
    const baseUrl = import.meta.env.VITE_BACKEND_URL || (
      import.meta.env.MODE === 'development'
        ? 'http://localhost:8888/.netlify/functions'
        : '/.netlify/functions'
    );
    
    const res = await fetch(`${baseUrl}/auth-google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }) // Send the token in request body
    });

    // Parse the JSON response from backend
    const data = await res.json();

    // If backend confirms success
    if (data.success) {
      // Save user data in your local AuthContext/state
      setUser(data.user);

      // If an access token is returned (optional, but useful for future auth)
      if (data.access_token) {
        // Store token in localStorage for persistence across reloads
        localStorage.setItem("quantum-quest-token", data.access_token);

        // Set the token in your API service so all future API calls include it
        apiService.setAuthToken(data.access_token);
      }
    } else {
      // If success is false, throw an error using the backend-provided message
      throw new Error(data.error || "Google sign-in failed");
    }
  } catch (err: any) {
    // Handle any network or parsing errors
    throw new Error(err.message || "Google auth error");
  } finally {
    // Always reset loading state
    setLoading(false);
  }
};


  const signOut = () => {
    localStorage.removeItem('quantum-quest-token');
    apiService.setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateProfile(data);
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const refreshUser = async () => {
    if (user) {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing Quantum Quest...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshUser,
      signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
