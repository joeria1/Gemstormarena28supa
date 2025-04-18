import React from 'react';
import ChatContainer from './ChatContainer';

interface ChatWindowProps {
  className?: string;
}

// This is a wrapper around ChatContainer to maintain compatibility
// with existing code that imports ChatWindow
const ChatWindow: React.FC<ChatWindowProps> = ({ className }) => {
  return <ChatContainer />;
};

export default ChatWindow;
