import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CloudRain } from 'lucide-react';
import { useUser } from './UserContext';

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

// Rain participant interface
export interface RainParticipant {
  userId: string;
  username: string;
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
  nextRainTimeRemaining: number;
  sendMessage: (message: ChatMessage) => void;
  toggleChat: () => void;
  setRainActive: (active: boolean) => void;
  joinRain: (userId: string, username: string) => boolean;
  hasJoinedRain: (userId: string) => boolean;
  rainAmount: number;
  rainParticipants: RainParticipant[];
  distributeRainRewards: () => { participants: RainParticipant[], rewardPerParticipant: number } | null;
}

// Create context with default values
export const ChatContext = createContext<ChatContextType>({
  isChatOpen: false, // Default to closed
  isRainActive: false,
  rainStatus: 'inactive',
  rainTimeRemaining: 0,
  nextRainTimeRemaining: 0,
  rainAmount: 100,
  messages: [],
  rainParticipants: [],
  sendMessage: () => {},
  toggleChat: () => {},
  setRainActive: () => {},
  joinRain: () => false,
  hasJoinedRain: () => false,
  distributeRainRewards: () => null,
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
  const [nextRainTimeRemaining, setNextRainTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [rainParticipants, setRainParticipants] = useState<RainParticipant[]>([]);
  const raintTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextRainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextRainCountdownRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load saved messages on mount
  useEffect(() => {
    try {
      // Load chat state from localStorage
      const savedChatOpen = localStorage.getItem('chatOpen');
      if (savedChatOpen) {
        setIsChatOpen(savedChatOpen === 'true');
      }
      
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
      if (nextRainCountdownRef.current) clearInterval(nextRainCountdownRef.current);
    };
  }, []);

  // Start the next rain countdown timer
  useEffect(() => {
    // Start a countdown timer that updates every second
    nextRainCountdownRef.current = setInterval(() => {
      const currentTime = Date.now();
      if (nextRainTime > 0) {
        const timeLeft = Math.max(0, Math.floor((nextRainTime - currentTime) / 1000));
        setNextRainTimeRemaining(timeLeft);
      }
    }, 1000);

    return () => {
      if (nextRainCountdownRef.current) clearInterval(nextRainCountdownRef.current);
    };
  }, [nextRainTime]);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Save chat open state to localStorage
  useEffect(() => {
    localStorage.setItem('chatOpen', isChatOpen.toString());
    // Add a class to the document body to handle layout adjustments
    if (isChatOpen) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }
  }, [isChatOpen]);
  
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
  
  // Toggle chat visibility - make sure class is toggled immediately
  const toggleChat = () => {
    const newIsOpen = !isChatOpen;
    setIsChatOpen(newIsOpen);
    
    // Update body class immediately
    if (newIsOpen) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }
  };
  
  // Start rain event
  const startRainEvent = () => {
    setRainStatus('active');
    setIsRainActive(true);
    setRainTimeRemaining(120); // 2 minutes
    setRainParticipants([]); // Reset participants list
    
    // Generate random rain amount (50-500)
    const amount = Math.floor(Math.random() * 450) + 50;
    setRainAmount(amount);
    
    // System message
    sendMessage({
      id: Date.now().toString(),
      text: `☔ RAIN EVENT STARTED! ${amount} gems up for grabs! You have 2 minutes to join. Rewards will be split among all participants. ☔`,
      user: {
        id: 'system',
        name: 'System',
        avatar: '/placeholder.svg'
      },
      timestamp: new Date().toISOString()
    });
    
    // Notify users
    toast('Rain event started!', {
      description: `${amount} gems are up for grabs! You have 2 minutes to join.`,
      icon: <CloudRain className="text-blue-500" />
    });
    
    // Open chat if closed
    if (!isChatOpen) {
      setIsChatOpen(true);
    }
  };
  
  // Distribute rain rewards to participants
  const distributeRainRewards = (): { participants: RainParticipant[], rewardPerParticipant: number } | null => {
    if (rainParticipants.length > 0) {
      // This function is called by the component that has access to UserContext
      // We're returning the calculated share for each participant
      const rewardPerParticipant = Math.floor(rainAmount / rainParticipants.length);
      return { participants: [...rainParticipants], rewardPerParticipant };
    }
    return null;
  };
  
  // End rain event and distribute rewards
  const endRainEvent = () => {
    setRainStatus('inactive');
    setIsRainActive(false);
    
    // Distribute rewards if there are participants
    if (rainParticipants.length > 0) {
      const rewardPerParticipant = Math.floor(rainAmount / rainParticipants.length);
      
      // System message
      sendMessage({
        id: Date.now().toString(),
        text: `☔ RAIN EVENT ENDED! ${rainParticipants.length} participants each received ${rewardPerParticipant} gems. Next rain in 30 minutes. ☔`,
        user: {
          id: 'system',
          name: 'System',
          avatar: '/placeholder.svg'
        },
        timestamp: new Date().toISOString()
      });
      
      // List participants
      sendMessage({
        id: Date.now().toString() + '1',
        text: `Rain participants: ${rainParticipants.map(p => p.username).join(', ')}`,
        user: {
          id: 'system',
          name: 'System',
          avatar: '/placeholder.svg'
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // No participants
      sendMessage({
        id: Date.now().toString(),
        text: `☔ RAIN EVENT ENDED! No participants joined this rain. Next rain in 30 minutes. ☔`,
        user: {
          id: 'system',
          name: 'System',
          avatar: '/placeholder.svg'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Schedule next rain
    scheduleNextRain();
  };
  
  // Schedule next rain event (every 30 minutes)
  const scheduleNextRain = () => {
    // Clear existing timer if any
    if (nextRainTimerRef.current) {
      clearTimeout(nextRainTimerRef.current);
    }
    
    // Calculate time until next rain (30 minutes from now)
    const nextRainDelay = 30 * 60 * 1000; // 30 minutes in milliseconds
    const nextRainTimeStamp = Date.now() + nextRainDelay;
    setNextRainTime(nextRainTimeStamp);
    setNextRainTimeRemaining(30 * 60); // 30 minutes in seconds
    
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
  
  // Join rain (replaces claimRain)
  const joinRain = (userId: string, username: string): boolean => {
    // Check if user already joined
    if (!hasJoinedRain(userId)) {
      setRainParticipants(prev => [...prev, { userId, username }]);
      return true;
    }
    return false;
  };
  
  // Check if user has joined rain
  const hasJoinedRain = (userId: string) => {
    return rainParticipants.some(participant => participant.userId === userId);
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
      nextRainTimeRemaining,
      rainAmount,
      messages, 
      rainParticipants,
      sendMessage, 
      toggleChat, 
      setRainActive,
      joinRain,
      hasJoinedRain,
      distributeRainRewards
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
