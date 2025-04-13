
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloudRain } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatWindowProps {
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isRainActive, rainStatus, rainTimeRemaining, claimRain, rainAmount } = useChat();
  
  // Mock user data
  const mockUsers = ['CryptoKing', 'GemHunter', 'LuckyPlayer', 'MoonShooter', 'SatoshiLover'];
  const mockAvatars = Array(5).fill('/placeholder.svg');
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === '') return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      user: {
        id: 'you',
        name: 'You',
        avatar: '/placeholder.svg',
      },
      timestamp: new Date().toISOString(),
    };
    
    sendMessage(newMessage);
    setMessage('');
  };
  
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className={cn("h-full flex flex-col overflow-hidden border-white/10", className)}>
      <div className="bg-black/40 border-b border-white/10 p-3 flex items-center justify-between">
        <h3 className="font-semibold">Live Chat</h3>
        
        {isRainActive && (
          <div className="flex items-center text-blue-400 animate-pulse">
            <CloudRain className="h-4 w-4 mr-1" />
            <span className="text-xs">
              {rainStatus === 'active' ? `Rain: ${rainTimeRemaining}s` : 'Rain Soon'}
            </span>
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 p-3 overflow-y-auto space-y-3 max-h-[400px]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.user.name === 'You' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex max-w-[85%]">
              {msg.user.name !== 'You' && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 mr-2 flex-shrink-0">
                  <img 
                    src={msg.user.avatar || '/placeholder.svg'} 
                    alt={msg.user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  {msg.user.name !== 'You' && (
                    <span className="font-medium text-gray-300">{msg.user.name}</span>
                  )}
                  <span>{formatTime(msg.timestamp)}</span>
                </div>
                
                <div 
                  className={`rounded-md px-3 py-2 ${
                    msg.user.name === 'You' 
                      ? 'bg-blue-600 text-white' 
                      : msg.user.id === 'system' 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-800 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              
              {msg.user.name === 'You' && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 ml-2 flex-shrink-0">
                  <img 
                    src={msg.user.avatar || '/placeholder.svg'} 
                    alt={msg.user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      
      {isRainActive && rainStatus === 'active' && (
        <div className="p-3 border-t border-white/10 bg-gradient-to-r from-blue-900/30 to-purple-900/30 animate-pulse">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Rain Event Active!</p>
              <p className="text-xs text-gray-400">{rainAmount} gems available</p>
            </div>
            <Button 
              onClick={claimRain} 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Claim Rain
            </Button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/30">
        <div className="flex">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-black/30 border-white/10"
          />
          <Button type="submit" className="ml-2">
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatWindow;
