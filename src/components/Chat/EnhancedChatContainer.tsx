
import React, { useState, useEffect, useRef } from 'react';
import ChatToggle from '../Chat/ChatToggle';
import { CloudRain, Gem, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { useChat } from '@/context/ChatContext';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  avatar?: string;
}

interface EnhancedChatContainerProps {
  className?: string;
}

const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({ className }) => {
  const { user, updateBalance } = useUser();
  const { isRainActive, claimRain, rainAmount } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [hasClaimed, setHasClaimed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with some mock messages
    const initialMessages: Message[] = [
      {
        id: '1',
        sender: 'System',
        text: 'Welcome to DUMP.FUN chat!',
        timestamp: new Date(Date.now() - 300000),
        avatar: '/placeholder.svg'
      },
      {
        id: '2',
        sender: 'RocketMan',
        text: 'Hey everyone, just won 2000 gems in Mines!',
        timestamp: new Date(Date.now() - 120000),
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RocketMan'
      },
      {
        id: '3',
        sender: 'CryptoLover',
        text: 'Anyone want to do a case battle?',
        timestamp: new Date(Date.now() - 60000),
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CryptoLover'
      }
    ];
    
    setMessages(initialMessages);
    
    // Add a new message every 30-60 seconds
    const interval = setInterval(() => {
      const mockUsers = ['CryptoKing', 'GemHunter', 'LuckyPlayer', 'MoonShooter', 'SatoshiLover'];
      const mockMessages = [
        'Just won 5000 gems on Blackjack!',
        'Anyone want to do a case battle?',
        'The rain drops are awesome!',
        'Going all in on Crash, wish me luck!',
        'This site is addictive!',
        'Who wants to battle me?',
        'Just hit a 10x on Mines!'
      ];
      
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: mockUsers[Math.floor(Math.random() * mockUsers.length)],
        text: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        timestamp: new Date(),
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${mockUsers[Math.floor(Math.random() * mockUsers.length)]}`
      };
      
      setMessages(prev => [...prev, newMessage]);
    }, Math.random() * 30000 + 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMessage.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text: inputMessage,
      timestamp: new Date(),
      avatar: user?.avatar || '/placeholder.svg'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' });
  };
  
  const handleClaimRain = () => {
    if (isRainActive && !hasClaimed) {
      claimRain();
      setHasClaimed(true);
      
      // Add claim message
      const claimMessage: Message = {
        id: Date.now().toString(),
        sender: 'System',
        text: `You've claimed ${rainAmount} gems from the rain! You'll receive them when the rain ends.`,
        timestamp: new Date(),
        avatar: '/placeholder.svg'
      };
      
      setMessages(prev => [...prev, claimMessage]);
      
      toast.success(`Claimed ${rainAmount} gems from the rain!`, {
        description: "Gems will be added to your balance when the rain ends."
      });
    }
  };

  return (
    <>
      <ChatToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      
      {isOpen && (
        <div className={`fixed top-0 right-0 w-full sm:w-96 md:w-[400px] h-full bg-gray-900 border-l border-gray-800 z-40 shadow-lg ${className || ''}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center">
                <CloudRain className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-white">Live Chat</h2>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-400 mr-4">Lv 1</span>
                <div className="flex items-center bg-gray-800 px-2 py-1 rounded-md mr-4">
                  <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                  <span className="text-white font-medium">{user?.balance || 0}</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender !== 'You' && (
                    <div className="h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <img 
                        src={message.avatar || '/placeholder.svg'} 
                        alt={message.sender} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="max-w-[75%]">
                    <div className="flex items-center mb-1">
                      {message.sender !== 'You' && (
                        <span className="font-bold text-sm text-white mr-2">{message.sender}</span>
                      )}
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                    </div>
                    <div 
                      className={`rounded-lg px-3 py-2 ${
                        message.sender === 'You' 
                          ? 'bg-blue-600 text-white' 
                          : message.sender === 'System'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800 text-white'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                  {message.sender === 'You' && (
                    <div className="h-8 w-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                      <img 
                        src={message.avatar || '/placeholder.svg'} 
                        alt={message.sender} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-800 bg-gray-900"
            >
              <div className="flex">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-l-md px-4 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
          
          {isRainActive && !hasClaimed && (
            <button
              onClick={handleClaimRain}
              className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-4 py-2 rounded-md z-50 animate-pulse hover:animate-none hover:from-yellow-500 hover:to-yellow-700 transition-all"
            >
              CLAIM RAIN!
            </button>
          )}
          
          {hasClaimed && isRainActive && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-green-400 to-green-600 text-black font-bold px-4 py-2 rounded-md z-50">
              CLAIMED! ({rainAmount} gems)
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EnhancedChatContainer;
