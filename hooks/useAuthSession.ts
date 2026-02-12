
import { useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, logout as authLogout } from '../services/authService';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getCurrentUser();
    if (session) setUser(session);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update local storage session
    localStorage.setItem('fintrack_session', JSON.stringify(updatedUser));
    // Update in users array
    const users = JSON.parse(localStorage.getItem('fintrack_users') || '[]');
    const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('fintrack_users', JSON.stringify(updatedUsers));
  };

  return { user, login, logout, updateUser };
};
