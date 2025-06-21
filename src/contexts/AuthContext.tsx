"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser, createOrUpdateUser, getUserData, type UserData } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    if (user) {
      try {
        const data = await getUserData(user.uid);
        setUserData(data);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const signIn = async () => {
    try {
      const user = await signInWithGoogle();
      await createOrUpdateUser(user);
      await refreshUserData();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await refreshUserData();
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signOut,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 