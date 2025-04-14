
import React from 'react';
import { motion } from 'framer-motion';

interface PulseAnimationProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
  delay?: number;
  type?: 'scale' | 'glow' | 'both';
  repeat?: number | 'infinite';
}

const PulseAnimation: React.FC<PulseAnimationProps> = ({ 
  isActive, 
  children, 
  className = "",
  color = "255, 255, 255",
  intensity = 'medium',
  duration = 1.5,
  delay = 0,
  type = 'both',
  repeat = 'infinite'
}) => {
  const getIntensityValues = () => {
    switch (intensity) {
      case 'low':
        return {
          scale: type === 'glow' ? [1, 1, 1, 1, 1] : [1, 1.02, 1, 1.01, 1],
          shadow: [0, 8, 4, 10, 0]
        };
      case 'high':
        return {
          scale: type === 'glow' ? [1, 1, 1, 1, 1] : [1, 1.08, 1, 1.05, 1],
          shadow: [0, 35, 20, 30, 0]
        };
      default: // medium
        return {
          scale: type === 'glow' ? [1, 1, 1, 1, 1] : [1, 1.05, 1, 1.03, 1],
          shadow: [0, 25, 15, 20, 0]
        };
    }
  };
  
  const intensityValues = getIntensityValues();
  
  // Only set up the animation if the component is active
  const animation = isActive ? {
    scale: type === 'glow' ? 1 : intensityValues.scale,
    boxShadow: type === 'scale' ? undefined : [
      `0 0 0 rgba(${color}, 0)`,
      `0 0 ${intensityValues.shadow[1]}px rgba(${color}, 0.5)`,
      `0 0 ${intensityValues.shadow[2]}px rgba(${color}, 0.3)`,
      `0 0 ${intensityValues.shadow[3]}px rgba(${color}, 0.5)`,
      `0 0 0 rgba(${color}, 0)`
    ]
  } : {};

  // Animation timing
  const transition = isActive ? {
    duration: duration,
    repeat: repeat,
    repeatType: "reverse" as const,
    delay: delay
  } : {};

  return (
    <motion.div 
      className={className}
      animate={animation}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export default PulseAnimation;
