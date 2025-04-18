import React, { createContext, useState, useContext } from 'react';
import { playCashoutSound } from '../utils/sounds';

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
  addBet: (amount: number) => void;
  addXp: (amount: number) => void;
  isUserEligibleForRain: () => boolean;
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
  addXp: () => {},
  isUserEligibleForRain: () => false,
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

    // Trigger balance notification for positive balance changes
    if (amount > 0) {
      // Play cashout sound directly
      playCashoutSound();
      
      // Show balance notification if available
      if (window.showBalanceChange) {
        window.showBalanceChange(amount);
      }
    }
  };

  const addBet = (amount: number) => {
    // Add to wagered amount
    const newWagered = (user.wagered || 0) + amount;
    
    // Add XP - 1 XP for every dollar wagered
    const xpToAdd = Math.floor(amount);
    const newXp = (user.xp || 0) + xpToAdd;
    
    // Calculate new level - simple formula: level up every 1000 XP
    const currentLevel = user.level || 1;
    const xpForNextLevel = currentLevel * 1000;
    const newLevel = newXp >= xpForNextLevel ? currentLevel + 1 : currentLevel;
    
    setUser(prevUser => ({
      ...prevUser,
      wagered: newWagered,
      xp: newXp,
      level: newLevel
    }));
  };
  
  const addXp = (amount: number) => {
    const newXp = (user.xp || 0) + amount;
    const currentLevel = user.level || 1;
    const xpForNextLevel = currentLevel * 1000;
    const newLevel = newXp >= xpForNextLevel ? currentLevel + 1 : currentLevel;
    
    setUser(prevUser => ({
      ...prevUser,
      xp: newXp,
      level: newLevel
    }));
  };
  
  const isUserEligibleForRain = () => {
    // User needs to be at least level 3 to claim rain
    return (user.level || 1) >= 3;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      updateBalance, 
      addBet, 
      addXp,
      isUserEligibleForRain
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

// Add TypeScript interface for the global window object
declare global {
  interface Window {
    showBalanceChange?: (amount: number) => void;
  }
}
