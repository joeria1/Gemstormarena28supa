
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { Input } from '@/components/ui/input';
import { Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import RainFeature from './RainFeature';
import { preventAutoScroll } from '@/utils/scrollFix';

const ChatContainer = () => {
  const { isChatOpen: isOpen, messages, sendMessage } = useChat();
  const { user } = useUser();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [userScrolled, setUserScrolled] = useState(false);
  
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
    const rainComponent = document.querySelector('div.rain-feature') as HTMLElement;
    if (rainComponent) {
      // Access the RainFeature's processRainCommand method
      const isRainCommand = (rainComponent as any).__reactProps$?.processRainCommand?.(trimmedMessage);
      
      if (isRainCommand) {
        setMessageInput('');
        return;
      }
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

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-black/60 backdrop-blur">
      <div className="p-3 border-b border-primary/20 flex justify-between items-center">
        <h3 className="font-semibold">Live Chat</h3>
        {user && (
          <div className="flex items-center text-sm">
            <Gem className="h-4 w-4 text-gem mr-1" />
            <span>{user.balance}</span>
          </div>
        )}
      </div>
      
      <div 
        className="flex-grow overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
        onScroll={handleScroll}
      >
        <RainFeature isOpen={true} />
        
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
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-primary/20">
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
