import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { Input } from '@/components/ui/input';
import { Gem, CloudRain, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import RainFeature from './RainFeature';
import ChatToggle from './ChatToggle';
import { preventAutoScroll } from '@/utils/scrollFix';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
};

const ChatContainer = () => {
  const { 
    isChatOpen, 
    messages, 
    sendMessage, 
    toggleChat, 
    isRainActive, 
    rainTimeRemaining,
    rainStatus,
    rainAmount,
    claimRain,
    setRainActive
  } = useChat();
  const { user, updateBalance } = useUser();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [userScrolled, setUserScrolled] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  
  // Prevent automatic scrolling
  useEffect(() => {
    preventAutoScroll();
  }, []);

  // Handle message submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim the message
    const trimmedMessage = messageInput.trim();
    
    if (!trimmedMessage) return;
    
    // Check if message is a rain command
    const isRainCommand = trimmedMessage.toLowerCase().startsWith('/rain');
    
    if (isRainCommand) {
      // Notify the context that rain is active
      setRainActive(true);
      
      // Check if this is a rain command with parameters
      const rainParams = trimmedMessage.split(' ');
      if (rainParams.length > 1) {
        const rainAmount = parseInt(rainParams[1]);
        if (!isNaN(rainAmount)) {
          toast.success(`Starting a rain event of ${rainAmount} gems!`);
        }
      } else {
        toast.success('Starting rain event!');
      }
      
      setMessageInput('');
      return;
    }

    // Check for end rain command
    if (trimmedMessage.toLowerCase() === '/endrain') {
      setRainActive(false);
      toast.info('Rain event ended');
      setMessageInput('');
      return;
    }
    
    if (!user) {
      toast.error('Please log in to chat');
      return;
    }
    
    // Send the message
    sendMessage({
      id: Date.now().toString(),
      text: trimmedMessage,
      user: {
        id: user.id,
        name: user.username,
        avatar: user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username),
      },
      timestamp: new Date().toISOString(),
    });
    
    setMessageInput('');
  };

  // Handle claiming rain
  const handleClaimRain = () => {
    if (!user) {
      toast.error('Please log in to claim rain gems');
      return;
    }
    
    if (hasClaimed) {
      toast.error('You have already claimed rain gems');
      return;
    }
    
    // Add gems to user balance
    updateBalance(rainAmount);
    setHasClaimed(true);
    
    toast.success(`You claimed ${rainAmount} gems from the rain!`);
    
    // Send system message
    sendMessage({
      id: Date.now().toString(),
      text: `${user.username} claimed ${rainAmount} gems from the rain! ☔`,
      user: {
        id: 'system',
        name: 'System',
        avatar: '/placeholder.svg'
      },
      timestamp: new Date().toISOString(),
    });
  };

  // Handle scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
    setUserScrolled(!isAtBottom);
  };

  // Scroll to bottom when new messages arrive, unless user has scrolled up
  useEffect(() => {
    if (!userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolled]);

  // Reset claim status when a new rain event starts
  useEffect(() => {
    if (isRainActive) {
      setHasClaimed(false);
    }
  }, [isRainActive]);

  if (!isChatOpen) {
    return <ChatToggle isOpen={isChatOpen} onToggle={toggleChat} />;
  }

  return (
    <>
      <ChatToggle isOpen={isChatOpen} onToggle={toggleChat} />
      <div className="fixed right-4 bottom-20 w-80 md:w-96 h-[500px] z-40 bg-black/80 border border-blue-900/50 rounded-xl shadow-xl backdrop-blur flex flex-col overflow-hidden">
        <div className="p-3 border-b border-blue-900/40 flex justify-between items-center bg-blue-950/80">
          <div className="flex items-center">
            <h3 className="font-semibold text-white">Live Chat</h3>
          </div>
          {user && (
            <div className="flex items-center text-sm">
              <Gem className="h-4 w-4 text-cyan-400 mr-1" />
              <span>{user.balance}</span>
            </div>
          )}
        </div>
        
        {rainStatus === 'active' && (
          <div className="bg-blue-900/40 p-2 border-b border-blue-900/40">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <CloudRain className="h-4 w-4 text-blue-400 mr-1" />
                <span className="text-sm font-medium text-blue-200">Rain Event</span>
              </div>
              <div className="flex items-center text-xs text-blue-200">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatTime(rainTimeRemaining)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-300">
                {rainAmount} gems up for grabs!
              </span>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-xs h-7 px-2"
                onClick={handleClaimRain}
                disabled={hasClaimed}
              >
                {hasClaimed ? 'Claimed' : 'Claim Gems'}
              </Button>
            </div>
          </div>
        )}
        
        <div 
          className="flex-grow overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-blue-900/40 scrollbar-track-transparent"
          onScroll={handleScroll}
        >          
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-2">
              <img 
                src={message.user.avatar} 
                alt={message.user.name} 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">{message.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-3 border-t border-blue-900/40">
          {user ? (
            <div className="flex space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="bg-black/50"
              />
              <Button type="submit">Send</Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => toast.error('Please log in to chat')}>
              Log in to chat
            </Button>
          )}
        </form>
      </div>
    </>
  );
};

export default ChatContainer;
