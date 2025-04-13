
import React, { createContext, useState, useContext } from 'react';

interface UserContextType {
  user: {
    id: string;
    username: string;
    balance: number;
    avatar?: string;
    level?: number;
    xp?: number;
    wagered?: number;
    wins?: number;
    referrals?: number;
  };
  updateUser: (user: any) => void;
  updateBalance: (amount: number) => void;
  addBet?: (amount: number) => void;
}

export const UserContext = createContext<UserContextType>({
  user: {
    id: 'player123',
    username: 'Player',
    balance: 5000,
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Player',
    level: 3,
    xp: 1500,
    wagered: 3450,
    wins: 32,
    referrals: 2
  },
  updateUser: () => {},
  updateBalance: () => {},
  addBet: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({
    id: 'player123',
    username: 'Player',
    balance: 5000,
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Player',
    level: 3,
    xp: 1500,
    wagered: 3450,
    wins: 32,
    referrals: 2
  });

  const updateUser = (newUser: any) => {
    setUser(newUser);
  };

  const updateBalance = (amount: number) => {
    setUser(prevUser => ({
      ...prevUser,
      balance: prevUser.balance + amount
    }));
  };

  const addBet = (amount: number) => {
    setUser(prevUser => ({
      ...prevUser,
      wagered: (prevUser.wagered || 0) + amount
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updateBalance, addBet }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
