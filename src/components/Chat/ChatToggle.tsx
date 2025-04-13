
import React from 'react';
import { MessageSquare, MessageSquareOff } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatToggle: React.FC<ChatToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <Button 
      onClick={onToggle} 
      variant="outline" 
      className="fixed right-4 bottom-4 z-50 bg-primary text-white shadow-lg hover:bg-primary/80"
      size="lg"
    >
      {isOpen ? (
        <MessageSquareOff className="h-7 w-7 text-white" />
      ) : (
        <>
          <MessageSquare className="h-7 w-7 text-white" />
          <span className="sr-only">Open Chat</span>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            !
          </span>
        </>
      )}
    </Button>
  );
};

export default ChatToggle;
