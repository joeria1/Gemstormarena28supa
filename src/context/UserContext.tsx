import React, { createContext, useState, useContext } from 'react';

interface UserContextType {
  user: {
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
}

const UserContext = createContext<UserContextType>({
  user: {
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
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({
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

  return (
    <UserContext.Provider value={{ user, updateUser, updateBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
