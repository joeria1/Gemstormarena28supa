import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSound } from './ui/sound-context';
import { getSoundPath } from '../utils/soundConfig';
import { playCashoutSound } from '../utils/sounds';

// Simple utility function to generate unique IDs (replace with uuid later)
const generateId = () => Math.random().toString(36).substring(2, 15);

interface BalanceNotification {
  id: string;
  amount: number;
  timestamp: number;
}

export const BalanceChangeManager = () => {
  const [notifications, setNotifications] = useState<BalanceNotification[]>([]);
  const [notificationPosition, setNotificationPosition] = useState({ left: 0, top: 0 });
  const { playSound } = useSound();

  // Update notification position based on the balance element position
  const updatePosition = useCallback(() => {
    const balanceElement = document.getElementById('user-balance');
    if (balanceElement) {
      const rect = balanceElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      setNotificationPosition({
        left: centerX,
        top: rect.bottom + window.scrollY
      });
    }
  }, []);

  // Update position on window resize
  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [updatePosition]);

  const addNotification = useCallback((amount: number) => {
    if (amount <= 0) return; // Only show positive balance changes
    
    // Update position when adding notification
    updatePosition();
    
    // Add new notification with unique ID
    const newNotification: BalanceNotification = {
      id: generateId(),
      amount,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Play cashout sound directly when notification appears
    playCashoutSound();
  }, [updatePosition]);

  // Remove notifications after they expire
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notification => now - notification.timestamp < 2000)
      );
    }, 500);
    
    return () => clearInterval(timer);
  }, []);

  // Expose the addNotification method globally
  useEffect(() => {
    (window as any).showBalanceChange = addNotification;
    
    return () => {
      delete (window as any).showBalanceChange;
    };
  }, [addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ 
        position: 'absolute',
        top: notificationPosition.top + 'px',
        left: notificationPosition.left + 'px',
        transform: 'translateX(-50%)'
      }}
    >
      {notifications.map((notification) => (
        <AnimatePresence key={notification.id}>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="text-green-500 text-xs font-medium">
              +{notification.amount.toFixed(2)}
            </div>
          </motion.div>
        </AnimatePresence>
      ))}
    </div>
  );
};

export default BalanceChangeManager; 