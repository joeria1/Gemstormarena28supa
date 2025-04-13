
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email?: string;
  balance: number;
  avatar?: string;
  totalBets: number; // Add totalBets for RakeBack tracking
  updateBalance: (amount: number) => void;
  addBet: (amount: number) => void; // Add method to track bets
}

interface UserContextType {
  user: User | null;
  login: (userData: Omit<User, 'updateBalance' | 'addBet'>) => void;
  logout: () => void;
  updateBalance: (amount: number) => void;
  addBet: (amount: number) => void; // Add method to track bets
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          ...parsedUser,
          updateBalance: (amount: number) => updateBalance(amount),
          addBet: (amount: number) => addBet(amount),
          totalBets: parsedUser.totalBets || 0, // Ensure totalBets exists
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const login = (userData: Omit<User, 'updateBalance' | 'addBet'>) => {
    const newUser = {
      ...userData,
      updateBalance: (amount: number) => updateBalance(amount),
      addBet: (amount: number) => addBet(amount),
      totalBets: userData.totalBets || 0, // Ensure totalBets exists
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateBalance = (amount: number) => {
    if (user) {
      setUser({
        ...user,
        balance: Math.max(0, user.balance + amount)
      });
    }
  };
  
  // Add a method to track bets for RakeBack
  const addBet = (amount: number) => {
    if (user) {
      setUser({
        ...user,
        totalBets: user.totalBets + amount
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateBalance, addBet }}>
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
