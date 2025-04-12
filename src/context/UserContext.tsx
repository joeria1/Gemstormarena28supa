
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  avatar?: string;
  balance: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateBalance: (amount: number) => void;
  login: () => void;
  logout: () => void;
}

const defaultUser: User = {
  id: 'user-1',
  username: 'GemHunter',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GemHunter',
  balance: 5000
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  updateBalance: () => {},
  login: () => {},
  logout: () => {}
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage or use default
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(defaultUser);
    }
    setLoading(false);
  }, []);

  // Store user in localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  // Update balance
  const updateBalance = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: prev.balance + amount
      };
    });
  };

  // Login
  const login = () => {
    setUser(defaultUser);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, updateBalance, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
