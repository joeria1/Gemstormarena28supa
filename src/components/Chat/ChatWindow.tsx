
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import { useSound } from '@/components/SoundManager';
import { Send, CloudRain, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface ChatWindowProps {
  className?: string;
}

const DEMO_USERS = [
  { id: 'user1', username: 'CryptoKing', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CryptoKing' },
  { id: 'user2', username: 'DiamondHands', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiamondHands' },
  { id: 'user3', username: 'MoonShooter', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MoonShooter' },
  { id: 'user4', username: 'SatoshiLover', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SatoshiLover' },
  { id: 'user5', username: 'GemCollector', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GemCollector' }
];

const DEMO_MESSAGES = [
  "Just won 5000 gems on Blackjack!",
  "Anyone else having luck with mines today?",
  "This rain is coming soon! Get ready!",
  "Lost everything on cases, time to reload lol",
  "How many mines are you guys playing with?",
  "DUMP.FUN to the moon 🚀🚀🚀",
  "Anyone want to do a case battle?",
  "When is the next rain?",
  "Just got a mythical item!",
  "This site is so addictive"
];

const ChatWindow: React.FC<ChatWindowProps> = ({ className }) => {
  const { user } = useUser();
  const { playSound } = useSound();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [rainCountdown, setRainCountdown] = useState<number | null>(null);
  const [rainActive, setRainActive] = useState(false);
  const [rainTimeLeft, setRainTimeLeft] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial messages
  useEffect(() => {
    // Generate some initial messages
    const initialMessages: Message[] = [];
    
    // Add system message
    initialMessages.push({
      id: 'system-1',
      userId: 'system',
      username: 'SYSTEM',
      avatar: '/placeholder.svg',
      content: 'Welcome to DUMP.FUN chat! Next rain in 15 minutes.',
      timestamp: new Date(Date.now() - 60000 * 15),
      isSystem: true
    });
    
    // Add some random user messages
    for (let i = 0; i < 5; i++) {
      const randomUser = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
      const randomMessage = DEMO_MESSAGES[Math.floor(Math.random() * DEMO_MESSAGES.length)];
      
      initialMessages.push({
        id: `msg-${Date.now()}-${i}`,
        userId: randomUser.id,
        username: randomUser.username,
        avatar: randomUser.avatar,
        content: randomMessage,
        timestamp: new Date(Date.now() - (60000 * (5 - i)))
      });
    }
    
    setMessages(initialMessages);

    // Set initial rain countdown
    setRainCountdown(15 * 60); // 15 minutes
  }, []);

  // Scroll to bottom when new messages come in
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Demo rain countdown
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (rainCountdown !== null && !rainActive) {
      countdownInterval = setInterval(() => {
        setRainCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            // Start rain
            startRain();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (rainActive) {
      countdownInterval = setInterval(() => {
        setRainTimeLeft(prev => {
          if (prev <= 1) {
            // End rain
            endRain();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(countdownInterval);
    };
  }, [rainCountdown, rainActive]);

  // Add demo messages periodically
  useEffect(() => {
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to add a message
        const randomUser = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
        const randomMessage = DEMO_MESSAGES[Math.floor(Math.random() * DEMO_MESSAGES.length)];
        
        addMessage(
          randomUser.id,
          randomUser.username,
          randomUser.avatar,
          randomMessage
        );
      }
    }, 8000); // Every 8 seconds

    return () => clearInterval(messageInterval);
  }, []);

  // Format countdown time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Add a new message
  const addMessage = (
    userId: string, 
    username: string, 
    avatar: string, 
    content: string,
    isSystem: boolean = false
  ) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${messages.length}`,
      userId,
      username,
      avatar,
      content,
      timestamp: new Date(),
      isSystem
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Play notification sound for system messages
    if (isSystem) {
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
    }
  };

  // Start rain event
  const startRain = () => {
    setRainActive(true);
    setRainTimeLeft(120); // 2 minutes
    
    // Add system message about rain
    addMessage(
      'system',
      'SYSTEM',
      '/placeholder.svg',
      '🌧️ GEM RAIN STARTED! Click the "Claim Rain" button to receive free gems! You have 2 minutes.',
      true
    );
    
    // Play rain sound
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-game-bonus-reached-2065.mp3');
  };

  // End rain event
  const endRain = () => {
    setRainActive(false);
    setRainCountdown(15 * 60); // Reset to 15 minutes
    
    // Add system message about rain ending
    addMessage(
      'system',
      'SYSTEM',
      '/placeholder.svg',
      '🌧️ Gem Rain has ended. Next rain in 15 minutes!',
      true
    );
  };

  // Claim rain rewards
  const claimRain = () => {
    if (!user) {
      toast.error('You must be logged in to claim rain rewards');
      return;
    }
    
    // Random reward amount
    const rewardAmount = Math.floor(Math.random() * 500) + 100;
    
    // Update user balance
    user.updateBalance(rewardAmount);
    
    // Show toast
    toast.success(`You claimed ${rewardAmount} gems from the rain!`);
    
    // Add system message
    addMessage(
      'system',
      'SYSTEM',
      '/placeholder.svg',
      `${user.username} claimed ${rewardAmount} gems from the rain!`,
      true
    );
    
    // Play reward sound
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !user) return;
    
    // Add user message
    addMessage(
      user.id,
      user.username,
      user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shiny',
      inputValue
    );
    
    // Clear input
    setInputValue('');
  };

  return (
    <Card className={`flex flex-col border-white/10 bg-black/40 backdrop-blur-md overflow-hidden ${className}`}>
      {/* Rain countdown or active indicator */}
      <div className={`p-2 border-b flex items-center justify-between ${
        rainActive 
          ? 'border-amber-500/50 bg-amber-500/10' 
          : 'border-white/10 bg-black/60'
      }`}>
        <div className="flex items-center">
          {rainActive ? (
            <>
              <CloudRain className="h-4 w-4 text-amber-400 animate-pulse mr-2" />
              <span className="text-amber-400 font-medium text-sm">
                Rain Active! 
              </span>
              <span className="ml-2 text-white/80 text-xs">
                Ends in: {formatTime(rainTimeLeft)}
              </span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-white/80 text-sm">
                Next Rain: <span className="text-blue-400 font-medium">{formatTime(rainCountdown || 0)}</span>
              </span>
            </>
          )}
        </div>
        
        {rainActive && (
          <Button 
            size="sm" 
            className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white"
            onClick={claimRain}
          >
            Claim Rain
          </Button>
        )}
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-3 h-[300px]">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-2 ${message.isSystem ? 'bg-primary/10 p-2 rounded-md' : ''}`}
          >
            <div className="flex items-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={message.avatar} alt={message.username} />
                <AvatarFallback>{message.username[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline">
                  <span className={`font-medium text-sm truncate ${
                    message.isSystem 
                      ? 'text-primary' 
                      : message.userId === user?.id 
                        ? 'text-sky-400' 
                        : 'text-white'
                  }`}>
                    {message.username}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-sm text-white/90 break-words">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-white/10 p-2 bg-black/60">
        <div className="flex items-center gap-2">
          <Input
            placeholder={user ? "Type a message..." : "Login to chat"}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="bg-muted/50 border-white/10"
            disabled={!user}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!user || !inputValue.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!user && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            <span>You must be logged in to participate in chat</span>
          </div>
        )}
      </form>
    </Card>
  );
};

export default ChatWindow;
