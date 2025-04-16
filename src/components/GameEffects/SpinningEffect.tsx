
import React, { ReactNode, useEffect, useState } from 'react';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';

interface SpinningEffectProps {
  isSpinning: boolean;
  children: ReactNode;
  duration?: number;
  intensity?: number;
  onComplete?: () => void;
  countdown?: number | null;
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
  onComplete,
  countdown
}) => {
  const [showCountdown, setShowCountdown] = useState<boolean>(!!countdown);
  const [countdownValue, setCountdownValue] = useState<number | null>(countdown || null);
  const [startSpinning, setStartSpinning] = useState<boolean>(false);

  useEffect(() => {
    if (isSpinning && countdown && countdownValue) {
      // Start countdown
      const timer = setInterval(() => {
        setCountdownValue(prev => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            clearInterval(timer);
            setShowCountdown(false);
            setStartSpinning(true);
            return null;
          }
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (isSpinning && !countdown) {
      // Start spinning immediately if no countdown
      setStartSpinning(true);
    }
  }, [isSpinning, countdown]);

  useEffect(() => {
    if (startSpinning && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
        setStartSpinning(false);
      }, duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [startSpinning, duration, onComplete]);

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
      {showCountdown && countdownValue && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="text-8xl font-bold text-[#00d7a3]">{countdownValue}</div>
        </div>
      )}
      
      {/* Use CaseSlider for the spinning animation */}
      {isSpinning ? (
        <CaseSlider
          items={defaultItems}
          onComplete={onComplete || (() => {})}
          isSpinning={startSpinning}
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
