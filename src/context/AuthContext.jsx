import { createContext, useState, useContext, useEffect } from 'react';
import { signInWithGoogle, signOutUser, onAuthChange } from '../services/firebase';

/**
 * AuthContext - Context for managing user authentication state
 */
const AuthContext = createContext();

/**
 * AuthProvider - Provider component for AuthContext
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in with Google
   */
  const login = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      console.error('Login error:', err);
    }
  };

  /**
   * Sign out current user
   */
  const logout = async () => {
    try {
      setError(null);
      await signOutUser();
    } catch (err) {
      setError(err.message || 'Failed to sign out');
      console.error('Logout error:', err);
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Custom hook to use the AuthContext
 * @returns {Object} - AuthContext value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 