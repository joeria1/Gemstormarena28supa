
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email?: string;
  balance: number;
  avatar?: string;
  totalBets: number;
  updateBalance: (amount: number) => void;
  addBet: (amount: number) => void;
}

interface UserContextType {
  user: User;
  updateBalance: (amount: number) => void;
  addBet: (amount: number) => void;
  login: () => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

export const UserContext = createContext<UserContextType>({
  user: {
    id: 'default-user',
    username: 'Player',
    balance: 5000,
    avatar: '/placeholder.svg',
    totalBets: 0,
    updateBalance: () => {},
    addBet: () => {},
  },
  updateBalance: () => {},
  addBet: () => {},
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: 'default-user',
    username: 'Player',
    balance: 5000,
    avatar: '/placeholder.svg',
    totalBets: 0,
    updateBalance: (amount: number) => updateBalance(amount),
    addBet: (amount: number) => addBet(amount),
  });

  const updateBalance = (amount: number) => {
    setUser(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance + amount)
    }));
  };
  
  const addBet = (amount: number) => {
    setUser(prev => ({
      ...prev,
      totalBets: prev.totalBets + amount
    }));
  };
  
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };
  
  const login = () => {
    // Simple login function for now - could be expanded later
    setUser({
      id: 'logged-in-user',
      username: 'Player',
      balance: 5000,
      avatar: '/placeholder.svg',
      totalBets: 0,
      updateBalance: (amount: number) => updateBalance(amount),
      addBet: (amount: number) => addBet(amount),
    });
  };
  
  const logout = () => {
    // Reset to default user
    setUser({
      id: 'default-user',
      username: 'Player',
      balance: 5000,
      avatar: '/placeholder.svg',
      totalBets: 0,
      updateBalance: (amount: number) => updateBalance(amount),
      addBet: (amount: number) => addBet(amount),
    });
  };

  return (
    <UserContext.Provider value={{ user, updateBalance, addBet, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
