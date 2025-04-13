
import React, { createContext, useState, useContext, useEffect } from 'react';

type ChatContextType = {
  isChatOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
  openChat: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const closeChat = () => setIsChatOpen(false);
  const openChat = () => setIsChatOpen(true);

  // Save chat state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('chatOpen');
    if (savedState) {
      setIsChatOpen(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatOpen', JSON.stringify(isChatOpen));
  }, [isChatOpen]);

  return (
    <ChatContext.Provider value={{ isChatOpen, toggleChat, closeChat, openChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
