
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import CaseSlider from '../CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';
import { playSound } from '@/utils/soundEffects';

const DAILY_ITEMS: SliderItem[] = [
  { id: 'daily-1', name: 'Small Gems', image: '/placeholder.svg', rarity: 'common', price: 50 },
  { id: 'daily-2', name: 'Medium Gems', image: '/placeholder.svg', rarity: 'uncommon', price: 150 },
  { id: 'daily-3', name: 'Large Gems', image: '/placeholder.svg', rarity: 'rare', price: 500 },
  { id: 'daily-4', name: 'Huge Gems', image: '/placeholder.svg', rarity: 'epic', price: 1000 },
  { id: 'daily-5', name: 'Massive Gems', image: '/placeholder.svg', rarity: 'legendary', price: 2500 }
];

const DailyFreeCase: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [isAvailable, setIsAvailable] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<SliderItem | null>(null);
  
  // Check if daily case is available
  useEffect(() => {
    const checkAvailability = () => {
      const lastClaimTime = localStorage.getItem('lastDailyClaim');
      
      if (!lastClaimTime) {
        setIsAvailable(true);
        return;
      }
      
      const lastClaim = parseInt(lastClaimTime);
      const now = Date.now();
      const timePassed = now - lastClaim;
      const timeRemaining = 24 * 60 * 60 * 1000 - timePassed; // 24 hours in ms
      
      if (timeRemaining <= 0) {
        setIsAvailable(true);
        setTimeUntilNext(0);
      } else {
        setIsAvailable(false);
        setTimeUntilNext(Math.floor(timeRemaining / 1000));
      }
    };
    
    checkAvailability();
    
    const interval = setInterval(() => {
      checkAvailability();
      
      if (!isAvailable && timeUntilNext > 0) {
        setTimeUntilNext(prev => prev - 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isAvailable, timeUntilNext]);
  
  // Format time as hh:mm:ss
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Claim daily case
  const claimDailyCase = () => {
    if (!user) {
      toast.error('Please login to claim your daily case');
      return;
    }
    
    if (!isAvailable) {
      toast.error('Daily case is not yet available');
      return;
    }
    
    setIsSpinning(true);
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-spin-1084.mp3');
  };
  
  // Handle spin complete
  const handleSpinComplete = (item: SliderItem) => {
    setLastReward(item);
    updateBalance(item.price);
    
    // Set last claim time
    localStorage.setItem('lastDailyClaim', Date.now().toString());
    setIsAvailable(false);
    setTimeUntilNext(24 * 60 * 60); // 24 hours in seconds
    
    toast.success(`Daily reward claimed: ${item.name}`, {
      description: `Worth ${item.price} gems!`
    });
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
  };
  
  return (
    <Card className="bg-black/40 border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Daily Free Case</h2>
        
        {!isAvailable && (
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatTime(timeUntilNext)}</span>
          </div>
        )}
      </div>
      
      <CaseSlider 
        items={DAILY_ITEMS} 
        onComplete={handleSpinComplete}
        spinDuration={5000}
        isSpinning={isSpinning}
        setIsSpinning={setIsSpinning}
      />
      
      <div className="mt-6 text-center">
        <Button 
          className="btn-primary"
          onClick={claimDailyCase}
          disabled={!isAvailable || isSpinning || !user}
        >
          {isSpinning ? "Opening..." : isAvailable ? "Claim Daily Case" : "Case Already Claimed"}
        </Button>
      </div>
      
      {lastReward && (
        <div className="mt-6 p-4 rounded-lg bg-black/20">
          <h3 className="text-sm font-medium mb-2">Last Reward</h3>
          <div className="flex items-center gap-4">
            <div 
              className={`w-12 h-12 rounded bg-gradient-to-b p-2 
                ${lastReward.rarity === 'common' ? 'from-gray-500 to-gray-400' : 
                  lastReward.rarity === 'uncommon' ? 'from-green-600 to-green-500' : 
                  lastReward.rarity === 'rare' ? 'from-blue-700 to-blue-600' :
                  lastReward.rarity === 'epic' ? 'from-purple-700 to-purple-600' :
                  'from-amber-600 to-amber-500'}`
              }
            >
              <img 
                src={lastReward.image} 
                alt={lastReward.name} 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-white font-medium">{lastReward.name}</h3>
              <p className="text-sm text-gray-300">{lastReward.price} gems</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DailyFreeCase;
