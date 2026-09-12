import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, isLocalMode } from '../services/api';
import { supabase } from '../services/supabase';
import { seedDemoData, resetDemoData, DEMO_OWNER_ID } from '../services/demoSeed';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of active session
    const initializeAuth = async () => {
      try {
        if (isLocalMode()) {
          // Pre-seed realistic demo data for portfolio & interview presentation
          seedDemoData();

          let activeToken = localStorage.getItem('mock_token');
          let users = JSON.parse(localStorage.getItem('mock_users') || '[]');

          // If no local session exists yet, auto-sign in as Demo user
          if (!activeToken || users.length === 0) {
            const demoUser = {
              id: DEMO_OWNER_ID,
              email: 'demo@mypropbook.app',
              fullName: 'Demo',
              user_metadata: {
                full_name: 'Demo',
                workspace_name: 'Demo Workspace'
              }
            };
            localStorage.setItem('mock_token', 'mock_demo_token');
            localStorage.setItem('mock_users', JSON.stringify([demoUser]));
            setUser(demoUser);
            setLoading(false);
            return;
          }
        }

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
          setUser(users[0] || { id: DEMO_OWNER_ID, email: 'demo@mypropbook.app', fullName: 'Demo' });
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

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = {
        ...user,
        fullName: profileData.fullName || user?.fullName,
        user_metadata: {
          ...user?.user_metadata,
          full_name: profileData.fullName || user?.user_metadata?.full_name,
          phone: profileData.phone,
          workspace_name: profileData.workspaceName,
          upi_id: profileData.upiId,
          avatar_color: profileData.avatarColor
        }
      };
      setUser(updatedUser);
      localStorage.setItem('mypropbook_user_profile', JSON.stringify(profileData));
      if (isLocalMode()) {
        localStorage.setItem('mock_users', JSON.stringify([updatedUser]));
        window.dispatchEvent(new Event('storage'));
      }
      return updatedUser;
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    }
  };

  const resetDemo = () => {
    if (isLocalMode()) {
      resetDemoData();
      seedDemoData(true);
      localStorage.removeItem('mypropbook_user_profile');
      window.location.reload();
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
    resetDemo,
    isLocal: isLocalMode()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

