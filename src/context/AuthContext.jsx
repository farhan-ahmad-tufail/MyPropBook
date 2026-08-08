import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, isLocalMode } from '../services/api';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of active session
    const initializeAuth = async () => {
      try {
        const currentUser = await api.auth.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Failed to initialize auth', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listeners if Supabase is active
    if (!isLocalMode() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Offline mode watcher
      const handleStorageChange = () => {
        const mockToken = localStorage.getItem('mock_token');
        if (!mockToken) {
          setUser(null);
        } else {
          const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
          setUser(users[0] || { id: 'mock_owner_id', email: 'owner@example.com', fullName: 'Demo Property Owner' });
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.auth.signIn(email, password);
      const activeUser = data.user;
      setUser(activeUser);
      if (isLocalMode()) {
        localStorage.setItem('mock_token', 'mock_token_value');
        // Dispatch storage event to notify other tabs/components
        window.dispatchEvent(new Event('storage'));
      }
      return activeUser;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName, phone = '') => {
    setLoading(true);
    try {
      const data = await api.auth.signUp(email, password, fullName, phone);
      const activeUser = data.user;
      setUser(activeUser);
      if (isLocalMode()) {
        localStorage.setItem('mock_token', 'mock_token_value');
        window.dispatchEvent(new Event('storage'));
      }
      return activeUser;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.auth.signOut();
      setUser(null);
      if (isLocalMode()) {
        localStorage.removeItem('mock_token');
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (isLocalMode()) {
      // In local mode, simulate a Google sign-in
      const mockUser = { id: 'google_mock_id', email: 'google@demo.com', fullName: 'Google Demo User' };
      setUser(mockUser);
      localStorage.setItem('mock_token', 'mock_token_value');
      localStorage.setItem('mock_users', JSON.stringify([mockUser]));
      window.dispatchEvent(new Event('storage'));
      return mockUser;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    isLocal: isLocalMode()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

