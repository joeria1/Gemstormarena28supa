
import React, { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SpinningEffectProps {
  isSpinning: boolean;
  children: ReactNode;
  duration?: number;
  intensity?: number;
  onComplete?: () => void;
}

const SpinningEffect: React.FC<SpinningEffectProps> = ({ 
  isSpinning, 
  children,
  duration = 8,
  intensity = 1,
  onComplete
}) => {
  useEffect(() => {
    if (isSpinning && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSpinning, duration, onComplete]);

  return (
    <div
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
    </div>
  );
};

export default SpinningEffect;
