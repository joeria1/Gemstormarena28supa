
import React, { useState, useEffect, useRef } from 'react';
import ChatToggle from '../Chat/ChatToggle';
import RainEffect from '../Rain/RainEffect';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

const EnhancedChatContainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with some mock messages
    const initialMessages: Message[] = [
      {
        id: '1',
        sender: 'System',
        text: 'Welcome to DUMP.FUN chat!',
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        sender: 'RocketMan',
        text: 'Hey everyone, just won 2000 gems in Mines!',
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: '3',
        sender: 'CryptoLover',
        text: 'Anyone want to do a case battle?',
        timestamp: new Date(Date.now() - 60000)
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
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
    }, Math.random() * 30000 + 30000);
    
    return () => clearInterval(interval);
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
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <ChatToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      
      {isOpen && (
        <div className="fixed top-0 right-0 w-full sm:w-96 md:w-1/3 h-full bg-gray-900 border-l border-gray-800 z-40 shadow-lg">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
              <h2 className="text-xl font-bold text-white">Live Chat</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex flex-col ${message.sender === 'You' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center mb-1">
                    <span className="font-bold text-sm text-white">{message.sender}</span>
                    <span className="text-xs text-gray-500 ml-2">{formatTime(message.timestamp)}</span>
                  </div>
                  <div 
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      message.sender === 'You' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
          
          <RainEffect />
        </div>
      )}
      
      {!isOpen && <RainEffect />}
    </>
  );
};

export default EnhancedChatContainer;
