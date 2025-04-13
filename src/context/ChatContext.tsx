
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

// Message interface
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

// Chat context type
interface ChatContextType {
  isChatOpen: boolean;
  messages: ChatMessage[];
  sendMessage: (message: ChatMessage) => void;
  toggleChat: () => void;
}

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  isChatOpen: false,
  messages: [],
  sendMessage: () => {},
  toggleChat: () => {}
});

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Load saved messages on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Set some default messages if none exist
        setMessages([
          {
            id: '1',
            text: 'Welcome to the chat! 👋',
            user: {
              id: 'system',
              name: 'System',
              avatar: '/placeholder.svg'
            },
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };
  
  // Send a new message
  const sendMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };
  
  return (
    <ChatContext.Provider value={{ isChatOpen, messages, sendMessage, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook for using the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};
