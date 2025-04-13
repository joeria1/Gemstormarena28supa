
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CloudRain } from 'lucide-react';

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

// Rain status type
type RainStatus = 'inactive' | 'active' | 'countdown';

// Chat context type
interface ChatContextType {
  isChatOpen: boolean;
  isRainActive: boolean;
  messages: ChatMessage[];
  rainTimeRemaining: number;
  rainStatus: RainStatus;
  sendMessage: (message: ChatMessage) => void;
  toggleChat: () => void;
  setRainActive: (active: boolean) => void;
  claimRain: () => void;
  rainAmount: number;
}

// Create context with default values
export const ChatContext = createContext<ChatContextType>({
  isChatOpen: false, // Default to closed
  isRainActive: false,
  rainStatus: 'inactive',
  rainTimeRemaining: 0,
  rainAmount: 100,
  messages: [],
  sendMessage: () => {},
  toggleChat: () => {},
  setRainActive: () => {},
  claimRain: () => {},
});

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRainActive, setIsRainActive] = useState(false);
  const [rainStatus, setRainStatus] = useState<RainStatus>('inactive');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rainTimeRemaining, setRainTimeRemaining] = useState(120); // 2 minutes in seconds
  const [rainAmount, setRainAmount] = useState(100);
  const [nextRainTime, setNextRainTime] = useState(0);
  const raintTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextRainTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
      
      // Initialize the rain timer
      scheduleNextRain();
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
    
    // Cleanup on unmount
    return () => {
      if (raintTimerRef.current) clearInterval(raintTimerRef.current);
      if (nextRainTimerRef.current) clearTimeout(nextRainTimerRef.current);
    };
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Handle rain timer
  useEffect(() => {
    if (rainStatus === 'active') {
      raintTimerRef.current = setInterval(() => {
        setRainTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(raintTimerRef.current as NodeJS.Timeout);
            endRainEvent();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (raintTimerRef.current) clearInterval(raintTimerRef.current);
      };
    }
  }, [rainStatus]);
  
  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };
  
  // Start rain event
  const startRainEvent = () => {
    setRainStatus('active');
    setIsRainActive(true);
    setRainTimeRemaining(120); // 2 minutes
    
    // Generate random rain amount (50-500)
    const amount = Math.floor(Math.random() * 450) + 50;
    setRainAmount(amount);
    
    // System message
    sendMessage({
      id: Date.now().toString(),
      text: `☔ RAIN EVENT STARTED! ${amount} gems up for grabs! You have 2 minutes to claim. ☔`,
      user: {
        id: 'system',
        name: 'System',
        avatar: '/placeholder.svg'
      },
      timestamp: new Date().toISOString()
    });
    
    // Notify users
    toast('Rain event started!', {
      description: `${amount} gems are up for grabs! You have 2 minutes to claim.`,
      icon: <CloudRain className="text-blue-500" />
    });
    
    // Open chat if closed
    if (!isChatOpen) {
      setIsChatOpen(true);
    }
  };
  
  // End rain event
  const endRainEvent = () => {
    setRainStatus('inactive');
    setIsRainActive(false);
    
    // System message
    sendMessage({
      id: Date.now().toString(),
      text: `☔ RAIN EVENT ENDED! All claims have been processed. Next rain in 15 minutes. ☔`,
      user: {
        id: 'system',
        name: 'System',
        avatar: '/placeholder.svg'
      },
      timestamp: new Date().toISOString()
    });
    
    // Schedule next rain
    scheduleNextRain();
  };
  
  // Schedule next rain event (every 15 minutes)
  const scheduleNextRain = () => {
    // Clear existing timer if any
    if (nextRainTimerRef.current) {
      clearTimeout(nextRainTimerRef.current);
    }
    
    // Calculate time until next rain (15 minutes from now)
    const nextRainDelay = 15 * 60 * 1000; // 15 minutes in milliseconds
    const nextRainTimeStamp = Date.now() + nextRainDelay;
    setNextRainTime(nextRainTimeStamp);
    
    // Schedule next rain
    nextRainTimerRef.current = setTimeout(() => {
      startRainEvent();
    }, nextRainDelay);
  };
  
  // Set rain active status
  const setRainActive = (active: boolean) => {
    if (active && rainStatus === 'inactive') {
      startRainEvent();
    } else if (!active && rainStatus === 'active') {
      endRainEvent();
    }
  };
  
  // Claim rain
  const claimRain = () => {
    // To be implemented with user context
    toast.success('You claimed rain gems!');
  };
  
  // Send a new message
  const sendMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };
  
  return (
    <ChatContext.Provider value={{ 
      isChatOpen, 
      isRainActive,
      rainStatus,
      rainTimeRemaining, 
      rainAmount,
      messages, 
      sendMessage, 
      toggleChat, 
      setRainActive,
      claimRain
    }}>
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
