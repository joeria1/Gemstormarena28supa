
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
  user: User; // Changed to always have a user
  updateBalance: (amount: number) => void;
  addBet: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a default user with 5000 gems
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

  return (
    <UserContext.Provider value={{ user, updateBalance, addBet }}>
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
