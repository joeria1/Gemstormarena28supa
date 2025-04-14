
import React from 'react';
import { motion } from 'framer-motion';

interface PulseAnimationProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

const PulseAnimation: React.FC<PulseAnimationProps> = ({ 
  isActive, 
  children, 
  className = "" 
}) => {
  return (
    <motion.div 
      className={className}
      animate={isActive ? {
        scale: [1, 1.05, 1, 1.03, 1],
        boxShadow: [
          "0 0 0 rgba(255, 255, 255, 0)",
          "0 0 20px rgba(255, 255, 255, 0.5)",
          "0 0 10px rgba(255, 255, 255, 0.3)",
          "0 0 20px rgba(255, 255, 255, 0.5)",
          "0 0 0 rgba(255, 255, 255, 0)"
        ]
      } : {}}
      transition={isActive ? {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse"
      } : {}}
    >
      {children}
    </motion.div>
  );
};

export default PulseAnimation;
