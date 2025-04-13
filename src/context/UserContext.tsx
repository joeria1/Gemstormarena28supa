
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name: string; // Add name as an alias for username for backward compatibility
  avatar: string;
  balance: number;
  level?: number;
  xp?: number;
  updateBalance: (amount: number) => void;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateBalance: (amount: number) => void;
  login: () => void;
  logout: () => void;
}

const defaultUser: Omit<User, 'updateBalance' | 'name'> = {
  id: 'user-1',
  username: 'GemHunter',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GemHunter',
  balance: 5000,
  level: 1,
  xp: 0
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          name: parsedUser.username, // Set name as an alias
          updateBalance: (amount) => updateBalance(amount)
        });
      } catch (e) {
        setUser({
          ...defaultUser,
          name: defaultUser.username, // Set name as an alias
          updateBalance: (amount) => updateBalance(amount)
        });
      }
    } else {
      setUser({
        ...defaultUser,
        name: defaultUser.username, // Set name as an alias
        updateBalance: (amount) => updateBalance(amount)
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const { updateBalance: _, name: __, ...userWithoutFunction } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutFunction));
      localStorage.setItem('userGems', user.balance.toString());
    }
  }, [user]);

  const updateBalance = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const newBalance = prev.balance + amount;
      
      // Also update localStorage directly for other components
      localStorage.setItem('userGems', newBalance.toString());
      
      return {
        ...prev,
        balance: newBalance,
      };
    });
  };

  const login = () => {
    setUser({
      ...defaultUser,
      name: defaultUser.username, // Set name as an alias
      updateBalance: (amount) => updateBalance(amount)
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userGems');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, updateBalance, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
