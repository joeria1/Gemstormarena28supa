import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSound } from './ui/sound-context';

interface BalanceChangeNotificationProps {
  amount: number;
}

export const BalanceChangeNotification: React.FC<BalanceChangeNotificationProps> = ({ amount }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { playSound } = useSound();

  useEffect(() => {
    // Play sound when notification appears
    playSound('/sounds/balance-change.mp3');
    
    // Auto-hide after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [playSound]);

  if (!isVisible || amount === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-20 right-5 z-50 pointer-events-none"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-lg shadow-lg px-4 py-2 flex items-center">
            <span className="text-xl mr-1">+</span>
            <span className="text-xl">{amount.toFixed(2)}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BalanceChangeNotification; 