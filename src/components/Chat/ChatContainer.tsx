import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { Input } from '@/components/ui/input';
import { Gem, CloudRain, Clock, X, MessageSquare, Timer, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { preventAutoScroll } from '@/utils/scrollFix';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
};

const CHAT_WIDTH = 384; // 24rem/384px - consistent width for all screen sizes above mobile

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
    joinRain,
    hasJoinedRain,
    setRainActive,
    nextRainTimeRemaining,
    rainParticipants,
    distributeRainRewards
  } = useChat();
  const { user, updateBalance, isUserEligibleForRain } = useUser();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [userScrolled, setUserScrolled] = useState(false);
  const [lastRainStatus, setLastRainStatus] = useState<'inactive' | 'active' | 'countdown'>('inactive');
  
  // Prevent automatic scrolling
  useEffect(() => {
    preventAutoScroll();
  }, []);

  // Effect to handle rain reward distribution when rain ends
  useEffect(() => {
    // If rain was active but now it's not, distribute rewards
    if (lastRainStatus === 'active' && rainStatus === 'inactive') {
      const rewardInfo = distributeRainRewards();
      
      if (rewardInfo && user) {
        // Check if current user was a participant
        const isParticipant = rewardInfo.participants.some(p => p.userId === user.id);
        
        if (isParticipant) {
          // Add the reward to user's balance
          updateBalance(rewardInfo.rewardPerParticipant);
          
          // Notify the user
          toast.success(`You received ${rewardInfo.rewardPerParticipant} gems from the rain!`);
        }
      }
    }
    
    // Update the last rain status
    setLastRainStatus(rainStatus);
  }, [rainStatus, user, distributeRainRewards, updateBalance]);

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

  // Handle joining rain
  const handleJoinRain = () => {
    if (!user) {
      toast.error('Please log in to join rain');
      return;
    }
    
    if (hasJoinedRain(user.id)) {
      toast.error('You have already joined this rain');
      return;
    }
    
    // Check if user is eligible (at least level 3)
    if (!isUserEligibleForRain()) {
      toast.error('You must be at least level 3 to join rain');
      return;
    }
    
    // Join the rain event
    const joined = joinRain(user.id, user.username);
    
    if (joined) {
      toast.success('You joined the rain successfully!');
      
      // Send system message
      sendMessage({
        id: Date.now().toString(),
        text: `${user.username} joined the rain! 🌧️`,
        user: {
          id: 'system',
          name: 'System',
          avatar: '/placeholder.svg'
        },
        timestamp: new Date().toISOString(),
      });
    }
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

  if (!isChatOpen) {
    return null; // Don't render anything when chat is closed
  }

  // Check if current user has joined the rain
  const userHasJoined = user ? hasJoinedRain(user.id) : false;

  return (
    <div className="h-full bg-black/90 border-l border-blue-900/50 backdrop-blur flex flex-col overflow-hidden shadow-xl">
      <div className="p-3 border-b border-blue-900/40 flex justify-between items-center bg-blue-950/80">
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 text-blue-400 mr-2" />
          <h3 className="font-semibold text-white">Live Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center text-sm">
              <Gem className="h-4 w-4 text-cyan-400 mr-1" />
              <span>{user.balance}</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleChat}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Next Rain Countdown - Always visible */}
      {rainStatus !== 'active' && (
        <div className="bg-blue-950/30 p-2 border-b border-blue-900/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CloudRain className="h-4 w-4 text-blue-300 mr-1" />
              <span className="text-sm font-medium text-blue-200">Next Rain</span>
            </div>
            <div className="flex items-center text-xs text-blue-200">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTime(nextRainTimeRemaining)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Active Rain Event */}
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
            <div>
              <span className="text-xs text-blue-300">
                {rainAmount} gems will be split among participants
              </span>
              <div className="flex items-center mt-1 text-xs text-blue-200">
                <Users className="h-3 w-3 mr-1" />
                <span>{rainParticipants.length} joined</span>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-xs h-7 px-2"
              onClick={handleJoinRain}
              disabled={userHasJoined || !isUserEligibleForRain()}
              title={!isUserEligibleForRain() ? "You must be at least level 3" : ""}
            >
              {userHasJoined ? 'Joined' : 'Join Rain'}
            </Button>
          </div>
          {!isUserEligibleForRain() && (
            <p className="text-xs text-yellow-300 mt-1">
              Must be at least level 3 to join
            </p>
          )}
          {userHasJoined && (
            <p className="text-xs text-green-300 mt-1">
              You joined! Rewards will be distributed when rain ends.
            </p>
          )}
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
  );
};

export default ChatContainer;
