import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  username: string;
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

const defaultUser: Omit<User, 'updateBalance'> = {
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          updateBalance: (amount) => updateBalance(amount)
        });
      } catch (e) {
        setUser({
          ...defaultUser,
          updateBalance: (amount) => updateBalance(amount)
        });
      }
    } else {
      setUser({
        ...defaultUser,
        updateBalance: (amount) => updateBalance(amount)
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const { updateBalance: _, ...userWithoutFunction } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutFunction));
    }
  }, [user]);

  const updateBalance = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: prev.balance + amount,
      };
    });
  };

  const login = () => {
    setUser({
      ...defaultUser,
      updateBalance: (amount) => updateBalance(amount)
    });
  };

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
