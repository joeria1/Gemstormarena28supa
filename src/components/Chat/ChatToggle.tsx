
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
      className="fixed right-4 bottom-4 z-50 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background/90"
    >
      {isOpen ? (
        <MessageSquareOff className="h-5 w-5 text-primary" />
      ) : (
        <MessageSquare className="h-5 w-5 text-primary" />
      )}
    </Button>
  );
};

export default ChatToggle;
