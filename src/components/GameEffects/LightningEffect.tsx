
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LightningEffectProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const LightningEffect: React.FC<LightningEffectProps> = ({ isVisible, onComplete }) => {
  const [paths, setPaths] = useState<string[]>([]);
  
  useEffect(() => {
    if (isVisible) {
      const newPaths = [];
      // Generate 3-5 random lightning paths
      const count = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < count; i++) {
        let path = `M${50 + (Math.random() * 20 - 10)} 0`;
        
        // Add 4-6 random zigzag points
        const points = Math.floor(Math.random() * 3) + 4;
        const height = 100 / points;
        
        for (let j = 1; j <= points; j++) {
          const x = 50 + (Math.random() * 60 - 30);
          const y = j * height;
          path += ` L${x} ${y}`;
        }
        
        newPaths.push(path);
      }
      
      setPaths(newPaths);
      
      // Call onComplete after animation finishes
      if (onComplete) {
        const timer = setTimeout(onComplete, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        {paths.map((path, index) => (
          <motion.path
            key={index}
            d={path}
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0, 1, 0.8, 1, 0],
              strokeWidth: [2, 3, 2, 4, 1]
            }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.1,
              times: [0, 0.2, 0.4, 0.7, 1],
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.1, 0.3, 0.1, 0.2, 0] 
        }}
        transition={{ 
          duration: 0.6,
          times: [0, 0.2, 0.3, 0.4, 0.5, 0.8]
        }}
      />
    </motion.div>
  );
};

export default LightningEffect;
