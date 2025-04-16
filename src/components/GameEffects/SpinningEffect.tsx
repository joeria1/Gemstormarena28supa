
import React, { ReactNode, useEffect } from 'react';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';

interface SpinningEffectProps {
  isSpinning: boolean;
  children: ReactNode;
  duration?: number;
  intensity?: number;
  onComplete?: () => void;
}

// Default case items if needed
const defaultItems: SliderItem[] = [
  { id: '1', name: 'Common Item', image: '/placeholder.svg', rarity: 'common', price: 50 },
  { id: '2', name: 'Uncommon Item', image: '/placeholder.svg', rarity: 'uncommon', price: 100 },
  { id: '3', name: 'Rare Item', image: '/placeholder.svg', rarity: 'rare', price: 250 },
  { id: '4', name: 'Epic Item', image: '/placeholder.svg', rarity: 'epic', price: 500 },
  { id: '5', name: 'Legendary Item', image: '/placeholder.svg', rarity: 'legendary', price: 1000 }
];

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
        pointerEvents: isSpinning ? 'none' : 'auto',
        zIndex: 100,
        opacity: isSpinning ? 1 : 0
      }}
    >
      {/* Use CaseSlider instead of the original spinning animation */}
      {isSpinning ? (
        <CaseSlider
          items={defaultItems}
          onComplete={onComplete || (() => {})}
          isSpinning={isSpinning}
          spinDuration={duration * 1000}
          autoSpin={true}
          caseName="Standard Case"
        />
      ) : (
        children
      )}
    </div>
  );
};

export default SpinningEffect;
