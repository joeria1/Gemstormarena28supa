
import React, { createContext, useState, useContext, useEffect } from 'react';

// Define Message type
export interface ChatMessage {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
}

type ChatContextType = {
  isChatOpen: boolean;
  isOpen: boolean;
  messages: ChatMessage[];
  sendMessage: (message: ChatMessage) => void;
  toggleChat: () => void;
  closeChat: () => void;
  openChat: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const closeChat = () => setIsChatOpen(false);
  const openChat = () => setIsChatOpen(true);

  const sendMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  // Save chat state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('chatOpen');
    if (savedState) {
      setIsChatOpen(JSON.parse(savedState));
    }
    
    // Load saved messages
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse saved messages');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatOpen', JSON.stringify(isChatOpen));
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [isChatOpen, messages]);

  return (
    <ChatContext.Provider value={{ 
      isChatOpen, 
      isOpen: isChatOpen, 
      messages, 
      sendMessage, 
      toggleChat, 
      closeChat, 
      openChat 
    }}>
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
