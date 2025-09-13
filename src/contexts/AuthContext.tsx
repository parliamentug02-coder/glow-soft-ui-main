import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getCurrentUser, initializeUserContext as libInitializeUserContext } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAndInitializeUser = async () => {
      setLoading(true);
      const currentUser = getCurrentUser();
      setUser(currentUser); // Set user state
      await libInitializeUserContext(); // This will now handle setting/clearing context based on currentUser
      setLoading(false);
    };

    loadAndInitializeUser();
  }, []); // Run once on mount

  // This useEffect handles subsequent user changes (e.g., after login/logout from AuthModal)
  useEffect(() => {
    if (!loading) { // Only run after initial load is complete
      libInitializeUserContext(); // Re-initialize context when user state changes
    }
  }, [user, loading]); // Depend on user and loading state

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};