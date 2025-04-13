
import React, { useState, useEffect, useContext, useRef } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { RainEffect } from '../Rain/RainEffect';
import { UserContext } from '../../context/UserContext';
import { MessageSquare, X, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';

type Message = {
  id: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isRain?: boolean;
  rainAmount?: number;
};

const ImprovedChatContainer = () => {
  const { isChatOpen, toggleChat } = useContext(ChatContext);
  const { user } = useContext(UserContext);
  const [isRaining, setIsRaining] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onlineUsers = 1234; // Mock data
  
  useEffect(() => {
    // Initialize with some mock messages
    const mockMessages: Message[] = [
      {
        id: '1',
        username: 'CryptoKing',
        avatar: 'https://i.pravatar.cc/150?img=1',
        message: 'Just won $500 on Blackjack!',
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: '2',
        username: 'LuckyGamer',
        avatar: 'https://i.pravatar.cc/150?img=2',
        message: 'Anyone want to join my Case Battle? 2v2',
        timestamp: new Date(Date.now() - 180000),
      },
      {
        id: '3',
        username: 'System',
        avatar: '/placeholder.svg',
        message: '🌧️ GambleGod started a rain! $100 distributed among 10 users!',
        timestamp: new Date(Date.now() - 60000),
        isRain: true,
        rainAmount: 100,
      },
    ];
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check for rain command
    if (inputValue.startsWith('/rain ')) {
      const amount = parseInt(inputValue.split(' ')[1], 10);
      if (!isNaN(amount) && amount > 0 && user.balance >= amount) {
        // Deduct from user balance would happen here
        startRain(amount);
      } else {
        const newErrorMessage: Message = {
          id: Date.now().toString(),
          username: 'System',
          avatar: '/placeholder.svg',
          message: 'Invalid rain amount or insufficient balance.',
          timestamp: new Date(),
        };
        setMessages([...messages, newErrorMessage]);
      }
    } else {
      const newMessage: Message = {
        id: Date.now().toString(),
        username: user.username || 'Anonymous',
        avatar: user.avatar || 'https://i.pravatar.cc/150?img=3',
        message: inputValue,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
    }

    setInputValue('');
  };

  const startRain = (amount: number) => {
    setIsRaining(true);
    
    // Add rain message
    const rainMessage: Message = {
      id: Date.now().toString(),
      username: 'System',
      avatar: '/placeholder.svg',
      message: `🌧️ ${user.username || 'Anonymous'} started a rain! $${amount} distributed among users!`,
      timestamp: new Date(),
      isRain: true,
      rainAmount: amount,
    };
    
    setMessages([...messages, rainMessage]);
    
    // Stop rain after 5 seconds
    setTimeout(() => {
      setIsRaining(false);
    }, 5000);
  };

  return (
    <>
      {isRaining && <RainEffect />}
      
      {!isChatOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 rounded-full p-3 z-50"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      <div
        className={cn(
          "fixed bottom-0 right-0 z-50 w-full sm:w-96 bg-gray-900 text-white rounded-t-lg transition-all duration-300 ease-in-out border-t border-gray-800 shadow-xl",
          isChatOpen ? "h-[500px]" : "h-0 overflow-hidden"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="font-bold">Live Chat</h2>
              <div className="ml-2 px-2 py-0.5 bg-green-600 rounded-full text-xs">
                {onlineUsers} online
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="hover:bg-gray-800 rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex items-start gap-2", msg.isRain && "bg-blue-900/20 p-2 rounded")}>
                <Avatar className="h-8 w-8">
                  <img src={msg.avatar} alt={msg.username} />
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{msg.username}</span>
                    <span className="text-xs text-gray-400">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={cn("text-sm", msg.isRain && "text-blue-400")}>{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-800">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message or /rain amount"
                className="bg-gray-800 border-gray-700"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Send
              </Button>
            </form>
            <div className="mt-2 text-xs text-gray-400">
              Tip: Type /rain [amount] to start a rain
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImprovedChatContainer;
