
import React from 'react';
import EnhancedChatContainer from './EnhancedChatContainer';

interface ChatWindowProps {
  className?: string;
}

// This is a wrapper around EnhancedChatContainer to maintain compatibility
// with existing code that imports ChatWindow
const ChatWindow: React.FC<ChatWindowProps> = ({ className }) => {
  return <EnhancedChatContainer className={className} />;
};

export default ChatWindow;
