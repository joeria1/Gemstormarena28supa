
import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatWindow from './ChatWindow';
import ChatToggle from './ChatToggle';
import { motion, AnimatePresence } from 'framer-motion';

const ChatContainer: React.FC = () => {
  const { isChatOpen, toggleChat } = useChat();

  return (
    <>
      <ChatToggle isOpen={isChatOpen} onToggle={toggleChat} />
      
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-16 bottom-0 w-80 sm:w-96 z-40 shadow-xl"
          >
            <ChatWindow />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatContainer;
