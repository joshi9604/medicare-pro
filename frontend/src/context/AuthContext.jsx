import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ShieldCheck, Stethoscope, User } from 'lucide-react';

const AuthContext = createContext();

const ROLE_META = {
  admin: { label: 'Admin', icon: ShieldCheck, color: '#1565c0' },
  doctor: { label: 'Doctor', icon: Stethoscope, color: '#10b981' },
  patient: { label: 'Patient', icon: User, color: '#8b5cf6' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medicare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('medicare_token', data.token);
    axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post('/api/auth/register', formData);
    localStorage.setItem('medicare_token', data.token);
    axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('medicare_token');
    delete axios.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  const roleMeta = useMemo(() => ROLE_META[user?.role] || ROLE_META.patient, [user?.role]);

  const value = useMemo(() => ({
    user,
    setUser,
    token,
    loading,
    login,
    register,
    logout,
    roleMeta
  }), [user, token, loading, roleMeta]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
