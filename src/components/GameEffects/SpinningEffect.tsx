
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SpinningEffectProps {
  isSpinning: boolean;
  children: ReactNode;
  duration?: number;
  intensity?: number;
}

const SpinningEffect: React.FC<SpinningEffectProps> = ({ 
  isSpinning, 
  children,
  duration = 8,
  intensity = 1
}) => {
  const rotateAnimation = {
    animate: isSpinning ? {
      rotate: 360,
      transition: {
        duration,
        ease: "linear",
        repeat: Infinity
      }
    } : {}
  };

  return (
    <motion.div
      {...rotateAnimation}
      style={{ 
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
        opacity: isSpinning ? 0.8 : 0
      }}
    >
      {children}
    </motion.div>
  );
};

export default SpinningEffect;
