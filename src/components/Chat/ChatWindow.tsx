
import React from 'react';
import EnhancedChatContainer from './EnhancedChatContainer';

// This is a wrapper around EnhancedChatContainer to maintain compatibility
// with existing code that imports ChatWindow
const ChatWindow: React.FC = () => {
  return <EnhancedChatContainer />;
};

export default ChatWindow;
