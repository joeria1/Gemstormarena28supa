
import React, { useState, useEffect, useRef } from 'react';
import { SliderItem, SliderProps } from "@/types/slider";
import { playTickSound, playStopSound } from "@/utils/sounds";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Gem } from "lucide-react";

const CaseSlider = ({
  items,
  onComplete,
  autoSpin = false,
  isCompact = false,
  playerName,
  highlightPlayer = false,
  options = {},
  spinDuration = 5000,
  isSpinning: externalSpinning,
  setIsSpinning: setExternalSpinning,
  caseName
}: SliderProps) => {
  // For controlling internal spinning state if not provided externally
  const [internalSpinning, setInternalSpinning] = useState(false);
  const spinning = setExternalSpinning ? externalSpinning : internalSpinning;
  const setSpinning = setExternalSpinning || setInternalSpinning;
  
  const { duration = spinDuration, itemSize = 'medium' } = options;
  
  // For the animation and sounds
  const sliderRef = useRef<HTMLDivElement>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastItemIndexRef = useRef<number>(0);
  const [selectedItem, setSelectedItem] = useState<SliderItem | null>(null);
  const [spinSequence, setSpinSequence] = useState<SliderItem[]>([]);
  const [winningItemIndex, setWinningItemIndex] = useState<number | null>(null);
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Generate a sequence of items for spinning that's much longer than the visible area
  const generateSpinSequence = () => {
    if (items.length === 0) return [];
    
    // Create a sequence with multiple repetitions to ensure smooth scrolling
    let sequence: SliderItem[] = [];
    for (let i = 0; i < 50; i++) {
      // Shuffle the items for each repetition to ensure randomness
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      sequence = [...sequence, ...shuffled];
    }
    return sequence;
  };

  // Initialize spin sequence when items change
  useEffect(() => {
    if (items.length > 0) {
      setSpinSequence(generateSpinSequence());
    }
  }, [items]);
  
  // Auto-spin on mount if enabled
  useEffect(() => {
    if (autoSpin && !spinning && items.length > 0) {
      startSpin();
    }
  }, [autoSpin, items]);

  // Reset animation flag when spinning changes
  useEffect(() => {
    if (spinning) {
      setAnimationStarted(false);
      setTimeout(() => {
        setAnimationStarted(true);
      }, 50);
    }
  }, [spinning]);
  
  // Handle playing tick sounds at correct intervals
  const checkAndPlayTickSound = () => {
    if (!sliderRef.current || !spinning) return;
    
    // Calculate current position
    const transform = getComputedStyle(sliderRef.current).transform;
    const matrix = new DOMMatrixReadOnly(transform);
    const currentX = matrix.m41;
    
    // Calculate which item we're on based on position
    const itemWidth = getItemWidth();
    const currentIndex = Math.floor(Math.abs(currentX) / itemWidth);
    
    if (currentIndex !== lastItemIndexRef.current) {
      playTickSound();
      lastItemIndexRef.current = currentIndex;
    }
  };
  
  // Reset the slider for a new spin
  const resetSlider = () => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = "none";
      sliderRef.current.style.transform = isCompact 
        ? "translateX(calc(50% - 40px))" 
        : "translateX(calc(50% - 60px))";
    }
    setWinningItemIndex(null);
    setSelectedItem(null);
  };
  
  // Start the spinning animation
  const startSpin = () => {
    if (spinning || items.length === 0) return;
    
    // Reset the slider first
    resetSlider();
    
    // Generate a new spin sequence
    const newSequence = generateSpinSequence();
    setSpinSequence(newSequence);
    setSelectedItem(null);
    setSpinning(true);
    lastItemIndexRef.current = 0;
    
    // Calculate which item will be selected (near the end but not the very end)
    const winningIndex = Math.floor(newSequence.length * 0.7) + 
      Math.floor(Math.random() * (newSequence.length * 0.2));
    
    // Determine the winning item (randomly pick from user's items array)
    const winner = items[Math.floor(Math.random() * items.length)];
    
    // Find the matching item in our sequence
    let targetIndex = winningIndex;
    // Look for the item with matching ID around our target index
    for (let i = winningIndex - 10; i < winningIndex + 10; i++) {
      if (i >= 0 && i < newSequence.length && newSequence[i].id === winner.id) {
        targetIndex = i;
        break;
      }
    }
    
    setWinningItemIndex(targetIndex);
    
    // Apply the spinning animation with CSS
    setTimeout(() => {
      if (sliderRef.current) {
        const itemWidth = getItemWidth();
        sliderRef.current.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0.85, 0.35, 1.0)`;
        
        // Calculate position to center the item in view
        const offset = isCompact ? 40 : 60; // Adjust based on container padding
        sliderRef.current.style.transform = `translateX(-${(targetIndex * itemWidth) - offset}px)`;
      }
      
      // Set up animation frame based tick detection
      const checkTicks = () => {
        checkAndPlayTickSound();
        if (spinning) {
          requestAnimationFrame(checkTicks);
        }
      };
      requestAnimationFrame(checkTicks);
    }, 100);
    
    // Complete the spin after the animation
    setTimeout(() => {
      setSpinning(false);
      setSelectedItem(winner);
      playStopSound();
      
      // Call the onComplete callback with the exact winning item from original items array
      onComplete(winner);
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
  
  // Helper function to get rarity color gradient
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
  
  // Helper function to get container height based on compact mode and item size
  const getContainerHeight = () => {
    if (isCompact) {
      return getItemHeight() + 40;
    } else {
      return getItemHeight() + 60;
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div 
        className={cn(
          "relative overflow-hidden rounded-lg border",
          isCompact ? "p-2" : "p-4",
          highlightPlayer ? "border-primary bg-black/90" : "border-white/10 bg-black/80"
        )}
        style={{ height: `${getContainerHeight()}px` }}
      >
        {(playerName || caseName) && !isCompact && (
          <div className="flex justify-between items-center absolute top-2 left-2 right-2 z-10">
            {playerName && (
              <div className={cn(
                "px-2 py-1 text-xs rounded-full",
                highlightPlayer ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/10 text-white border border-white/20"
              )}>
                {playerName}
              </div>
            )}
            
            {caseName && (
              <div className="px-2 py-1 text-xs rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/40">
                {caseName}
              </div>
            )}
          </div>
        )}
        
        {/* Center pointer/indicator */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-primary z-20 transform -translate-x-1/2">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rotate-45"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-primary rotate-45"></div>
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
              transform: 'translateX(calc(50% - 60px))'
            }}
          >
            {spinSequence.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={cn(
                  "flex-shrink-0 mx-1 rounded flex flex-col items-center justify-between transition-transform",
                  winningItemIndex === index ? "scale-105" : ""
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
      
      {!autoSpin && (
        <div className="mt-6 text-center">
          <Button 
            className="btn-primary"
            onClick={startSpin}
            disabled={spinning}
          >
            {spinning ? "Spinning..." : "Spin Now"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CaseSlider;
