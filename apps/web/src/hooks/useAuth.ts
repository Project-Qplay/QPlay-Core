import { useState } from 'react';

// Mock user for development - replace with actual auth integration
const mockUser = {
  username: "QuantumPlayer",
  avatar_url: null,
  games_completed: 12,
  total_score: 8750,
  quantum_mastery_level: 4,
  best_completion_time: 340,
};

/**
 * A simple authentication hook
 * This is a placeholder that would be replaced with real authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState(mockUser);

  const signIn = (username: string, password: string) => {
    console.log(`Sign in with ${username}`);
    setUser(mockUser);
    return Promise.resolve(mockUser);
  };

  const signUp = (username: string, email: string, password: string) => {
    console.log(`Sign up with ${username} and ${email}`);
    setUser(mockUser);
    return Promise.resolve(mockUser);
  };

  const signOut = () => {
    console.log('Sign out');
    setUser(null);
    return Promise.resolve();
  };

  return {
    user,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
};

export default useAuth;
