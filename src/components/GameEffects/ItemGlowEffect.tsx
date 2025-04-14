
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ItemGlowEffectProps {
  isActive: boolean;
  color?: string;
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  playSound?: boolean;
}

const ItemGlowEffect: React.FC<ItemGlowEffectProps> = ({ 
  isActive, 
  color = "rgba(255, 215, 0, 0.8)", // Default gold color
  children, 
  className = "",
  intensity = 'medium',
  playSound = true
}) => {
  useEffect(() => {
    if (isActive && playSound) {
      // Play sound effect when item is selected
      const audio = new Audio('/sounds/win.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play error:", e));
    }
  }, [isActive, playSound]);

  const getIntensityConfig = () => {
    switch (intensity) {
      case 'low':
        return {
          scale: [1, 1.02, 1, 1.01, 1],
          rotate: [0, 0.5, -0.5, 0.2, 0],
          duration: 1.2,
          repeat: 1
        };
      case 'high':
        return {
          scale: [1, 1.08, 1, 1.05, 1],
          rotate: [0, 2, -2, 1, 0],
          duration: 2,
          repeat: 3
        };
      default: // medium
        return {
          scale: [1, 1.05, 1, 1.03, 1],
          rotate: [0, 1, -1, 0.5, 0],
          duration: 1.5,
          repeat: 2
        };
    }
  };

  const intensityConfig = getIntensityConfig();

  return (
    <motion.div 
      className={`relative ${className}`}
      animate={isActive ? { 
        scale: intensityConfig.scale,
        rotate: intensityConfig.rotate,
      } : {}}
      transition={isActive ? { 
        duration: intensityConfig.duration,
        repeat: intensityConfig.repeat,
        repeatType: "reverse"
      } : {}}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg z-10"
          style={{ 
            boxShadow: `0 0 20px 10px ${color}`,
            background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0.5, 0.7, 0.4],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}
      {children}
    </motion.div>
  );
};

export default ItemGlowEffect;
