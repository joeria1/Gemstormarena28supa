
import React from 'react';
import { motion } from 'framer-motion';

interface PulseAnimationProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const PulseAnimation: React.FC<PulseAnimationProps> = ({ 
  isActive, 
  children, 
  className = "",
  color = "255, 255, 255",
  intensity = 'medium'
}) => {
  const getIntensityValues = () => {
    switch (intensity) {
      case 'low':
        return {
          scale: [1, 1.03, 1, 1.02, 1],
          shadow: [0, 10, 5, 15, 0]
        };
      case 'high':
        return {
          scale: [1, 1.08, 1, 1.05, 1],
          shadow: [0, 30, 15, 25, 0]
        };
      default: // medium
        return {
          scale: [1, 1.05, 1, 1.03, 1],
          shadow: [0, 20, 10, 15, 0]
        };
    }
  };
  
  const intensityValues = getIntensityValues();
  
  return (
    <motion.div 
      className={className}
      animate={isActive ? {
        scale: intensityValues.scale,
        boxShadow: [
          `0 0 0 rgba(${color}, 0)`,
          `0 0 ${intensityValues.shadow[1]}px rgba(${color}, 0.5)`,
          `0 0 ${intensityValues.shadow[2]}px rgba(${color}, 0.3)`,
          `0 0 ${intensityValues.shadow[3]}px rgba(${color}, 0.5)`,
          `0 0 0 rgba(${color}, 0)`
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
