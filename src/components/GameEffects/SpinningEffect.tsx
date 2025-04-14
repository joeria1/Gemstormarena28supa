
import React from 'react';
import { motion } from 'framer-motion';

interface SpinningEffectProps {
  isSpinning: boolean;
  children: React.ReactNode;
  className?: string;
  onComplete?: () => void;
}

const SpinningEffect: React.FC<SpinningEffectProps> = ({ 
  isSpinning, 
  children, 
  className = "",
  onComplete
}) => {
  return (
    <motion.div
      className={className}
      animate={
        isSpinning 
          ? { 
              rotateY: [0, 360],
              filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
            } 
          : {}
      }
      transition={
        isSpinning 
          ? { 
              rotateY: { 
                duration: 0.5,
                ease: "easeInOut",
                repeat: 3,
                repeatType: "loop"
              },
              filter: {
                duration: 0.5,
                repeat: 3,
                repeatType: "reverse"
              },
              onComplete: onComplete
            } 
          : {}
      }
    >
      {children}
    </motion.div>
  );
};

export default SpinningEffect;
