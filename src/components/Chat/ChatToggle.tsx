
import React from 'react';
import { MessageSquare, MessageSquareOff, CloudRain } from 'lucide-react';
import { Button } from '../ui/button';
import { useChat } from '@/context/ChatContext';

interface ChatToggleProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const ChatToggle: React.FC<ChatToggleProps> = ({ isOpen, onToggle }) => {
  const { isRainActive, rainTimeRemaining, toggleChat } = useChat();
  
  // If not provided via props, we'll use internal state or context
  const handleToggle = onToggle || toggleChat;
  
  return (
    <Button 
      onClick={handleToggle} 
      variant="outline" 
      className="fixed right-4 bottom-4 z-50 bg-blue-950 text-white shadow-lg hover:bg-blue-900 scale-110 border-2 border-blue-800/50"
      size="lg"
      type="button"
    >
      {isOpen ? (
        <MessageSquareOff className="h-8 w-8 text-white" />
      ) : (
        <>
          <MessageSquare className="h-8 w-8 text-white" />
          <span className="sr-only">Open Chat</span>
          {isRainActive && (
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse border border-white">
              <CloudRain className="h-4 w-4" />
            </span>
          )}
        </>
      )}
    </Button>
  );
};

export default ChatToggle;
