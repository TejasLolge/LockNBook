import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = authApi.getCurrentUser();
    if (saved) {
      setUser(saved);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
