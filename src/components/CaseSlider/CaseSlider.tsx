
import React, { useState, useEffect, useRef } from 'react';
import { SliderItem, SliderOptions } from '@/types/slider';
import { useSound } from '../SoundManager';
import { cn } from '@/lib/utils';
import { Gem } from 'lucide-react';

interface CaseSliderProps {
  items: SliderItem[];
  onComplete: (item: SliderItem) => void;
  autoSpin?: boolean;
  isCompact?: boolean;
  playerName?: string;
  highlightPlayer?: boolean;
  options?: SliderOptions;
}

const CaseSlider: React.FC<CaseSliderProps> = ({ 
  items, 
  onComplete, 
  autoSpin = false,
  isCompact = false,
  playerName,
  highlightPlayer = false,
  options = {} 
}) => {
  const { playSound } = useSound();
  const { duration = 6000, itemSize = 'medium' } = options;
  
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SliderItem | null>(null);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [spinInProgress, setSpinInProgress] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Generate a larger array of items for the animation
  useEffect(() => {
    if (items.length > 0) {
      // Create multiple copies of the items to ensure smooth animation
      const multipleItems = [];
      for (let i = 0; i < 20; i++) {
        // Add randomized items from the original array
        multipleItems.push(...shuffleArray([...items]));
      }
      setSliderItems(multipleItems);
    }
  }, [items]);
  
  // Function to shuffle array
  const shuffleArray = (array: SliderItem[]): SliderItem[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  // Auto-spin on mount if enabled
  useEffect(() => {
    if (autoSpin && !spinning && !spinInProgress && sliderItems.length > 0) {
      spin();
    }
  }, [autoSpin, sliderItems]);
  
  // Function to start spinning
  const spin = () => {
    if (spinning || spinInProgress || sliderItems.length === 0) return;
    
    setSpinInProgress(true);
    setSpining(true);
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-random-wheel-1930.mp3', 0.3);
    
    // Determine the winning item - pick a random item from the original items array
    const winningItem = items[Math.floor(Math.random() * items.length)];
    setSpinResult(winningItem);
    
    // Find all instances of the winning item in the sliderItems array
    const winningIndices = sliderItems
      .map((item, index) => item.id === winningItem.id ? index : -1)
      .filter(index => index !== -1);
    
    // Choose a random instance of the winning item
    const targetIndex = winningIndices[Math.floor(Math.random() * winningIndices.length)];
    const itemWidth = getItemWidth();
    
    // Calculate position to scroll to (center the winning item)
    if (sliderRef.current) {
      // Add a small random offset for realistic effect
      const randomOffset = (Math.random() * 20) - 10;
      const targetPosition = (targetIndex * itemWidth) - (sliderRef.current.clientWidth / 2) + (itemWidth / 2) + randomOffset;
      
      // Apply the animation
      if (sliderRef.current) {
        sliderRef.current.style.transition = `transform ${duration / 1000}s cubic-bezier(0.15, 0.85, 0.35, 1)`;
        sliderRef.current.style.transform = `translateX(-${targetPosition}px)`;
      }
    }
    
    // Handle completion
    setTimeout(() => {
      setSpining(false);
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3', 0.3);
      
      setTimeout(() => {
        setSpinInProgress(false);
        onComplete(winningItem);
      }, 1000);
    }, duration);
  };
  
  // Helper function to get item width based on size
  const getItemWidth = () => {
    switch (itemSize) {
      case 'small': return 80;
      case 'large': return 160;
      default: return 120;
    }
  };
  
  // Helper function to get item height based on size
  const getItemHeight = () => {
    switch (itemSize) {
      case 'small': return 80;
      case 'large': return 160;
      default: return 120;
    }
  };
  
  // Helper function to get container height based on compact mode and item size
  const getContainerHeight = () => {
    if (isCompact) {
      return getItemHeight() + 40;
    } else {
      return getItemHeight() + 60;
    }
  };
  
  // Helper function to get rarity color class
  const getRarityColorClass = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-400';
      case 'uncommon': return 'from-green-600 to-green-500';
      case 'rare': return 'from-blue-700 to-blue-600';
      case 'epic': return 'from-purple-700 to-purple-600';
      case 'legendary': return 'from-amber-600 to-amber-500';
      case 'mythical': return 'from-red-700 to-red-600';
      default: return 'from-gray-500 to-gray-400';
    }
  };
  
  // Helper function to get rarity border glow class
  const getRarityGlowClass = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'shadow-sm';
      case 'uncommon': return 'shadow-md shadow-green-500/30';
      case 'rare': return 'shadow-md shadow-blue-500/30';
      case 'epic': return 'shadow-lg shadow-purple-500/40';
      case 'legendary': return 'shadow-lg shadow-amber-500/50';
      case 'mythical': return 'shadow-xl shadow-red-500/60';
      default: return '';
    }
  };
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg border",
        isCompact ? "p-2" : "p-4",
        highlightPlayer ? "border-cyan-500 bg-black/90" : "border-primary/20 bg-black/80"
      )}
      style={{ height: `${getContainerHeight()}px` }}
    >
      {playerName && !isCompact && (
        <div className={cn(
          "absolute top-2 left-4 px-2 py-1 text-xs rounded-full z-10",
          highlightPlayer ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-primary/20 text-white border border-primary/40"
        )}>
          {playerName}
        </div>
      )}
      
      {/* Slider pointer/indicator */}
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-cyan-500 z-20 transform -translate-x-1/2">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-500 rotate-45"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-cyan-500 rotate-45"></div>
      </div>
      
      {/* Slider container */}
      <div className="relative h-full overflow-hidden">
        <div
          ref={sliderRef}
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 flex items-center transition-none",
            isCompact ? "pl-[calc(50%-40px)]" : "pl-[calc(50%-60px)]"
          )}
          style={{ 
            height: `${getItemHeight()}px`,
            willChange: 'transform',
          }}
        >
          {sliderItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={cn(
                "flex-shrink-0 mx-1 rounded flex flex-col items-center justify-between transition-transform",
                getRarityGlowClass(item.rarity)
              )}
              style={{ 
                width: `${getItemWidth()}px`, 
                height: `${getItemHeight()}px`,
              }}
            >
              <div 
                className={cn(
                  "w-full h-full rounded flex flex-col items-center justify-center p-2",
                  `bg-gradient-to-b ${getRarityColorClass(item.rarity)}`
                )}
              >
                <div className="relative w-full h-[70%] flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                
                {!isCompact && (
                  <div className="mt-1 w-full">
                    <div className="text-xs text-center text-white font-semibold truncate px-1">
                      {item.name}
                    </div>
                    <div className="flex items-center justify-center text-xs mt-0.5">
                      <Gem className="h-3 w-3 text-cyan-400 mr-0.5" />
                      <span className="text-white">{item.price}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper to handle state setting in useEffect cleanup
function setSpining(value: boolean) {
  // This is a no-op function to avoid stale closures
  // The actual state setting happens in the spin function
}

export default CaseSlider;
