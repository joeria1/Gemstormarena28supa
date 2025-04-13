
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/context/UserContext';
import { Gift, Clock, Gem } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface DailyReward {
  name: string;
  image: string;
  value: number;
  rarity: string;
}

const REWARDS: DailyReward[] = [
  { name: 'Small Gems Pack', image: '/placeholder.svg', value: 50, rarity: 'common' },
  { name: 'Medium Gems Pack', image: '/placeholder.svg', value: 100, rarity: 'uncommon' },
  { name: 'Large Gems Pack', image: '/placeholder.svg', value: 250, rarity: 'rare' },
  { name: 'Huge Gems Pack', image: '/placeholder.svg', value: 500, rarity: 'epic' },
  { name: 'Colossal Gems Pack', image: '/placeholder.svg', value: 1000, rarity: 'legendary' },
];

const DailyFreeCase: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<DailyReward | null>(null);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>('');
  const [canClaim, setCanClaim] = useState(false);

  // Check if player can claim the daily reward
  const { data: lastClaimData, refetch } = useQuery({
    queryKey: ['dailyReward', user?.id],
    queryFn: async () => {
      // Simulate API call - in a real app, this would check the server
      const lastClaim = localStorage.getItem('lastDailyRewardClaim');
      return lastClaim ? new Date(lastClaim) : null;
    },
    enabled: !!user
  });

  // Update time remaining
  useEffect(() => {
    const checkEligibility = () => {
      if (!lastClaimData) {
        setCanClaim(true);
        setTimeUntilNextClaim('Claim now!');
        return;
      }

      const now = new Date();
      const lastClaim = new Date(lastClaimData);
      const nextClaimTime = new Date(lastClaim);
      nextClaimTime.setHours(nextClaimTime.getHours() + 24);
      
      const timeDiff = nextClaimTime.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCanClaim(true);
        setTimeUntilNextClaim('Claim now!');
      } else {
        setCanClaim(false);
        
        // Format time
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        setTimeUntilNextClaim(`${hours}h ${minutes}m ${seconds}s`);
      }
    };
    
    checkEligibility();
    const timer = setInterval(checkEligibility, 1000);
    
    return () => clearInterval(timer);
  }, [lastClaimData]);

  const claimReward = () => {
    if (!user) {
      toast.error('Please log in to claim your daily reward');
      return;
    }
    
    if (!canClaim) {
      toast.error('You\'ve already claimed your daily reward');
      return;
    }
    
    setIsSpinning(true);
    
    // Simulate spinning and reward selection
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * REWARDS.length);
      const selectedReward = REWARDS[randomIndex];
      
      setReward(selectedReward);
      updateBalance(selectedReward.value);
      
      toast.success(`You received: ${selectedReward.name}!`, {
        description: `${selectedReward.value} gems have been added to your balance.`
      });
      
      // Save claim time
      localStorage.setItem('lastDailyRewardClaim', new Date().toISOString());
      refetch();
      
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <Card className="bg-black/40 border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-primary/20 p-2 rounded-full mr-3">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Daily Free Case</h3>
        </div>
        <div className="flex items-center text-sm bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <Clock className="h-4 w-4 mr-1 text-blue-400" />
          <span>{timeUntilNextClaim}</span>
        </div>
      </div>
      
      <div className="bg-gradient-to-b from-blue-900/30 to-violet-900/30 rounded-xl p-6 mb-6 border border-white/5">
        <div className="grid grid-cols-5 gap-4 mb-6">
          {REWARDS.map((item, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-2 text-center ${
                reward === item 
                  ? 'bg-gradient-to-b from-primary/30 to-primary/10 border border-primary/30 transform scale-110 transition-all'
                  : 'bg-black/30 border border-white/10'
              }`}
            >
              <div className="aspect-square rounded-md p-2 mb-2 flex items-center justify-center">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <p className="text-xs font-medium truncate">{item.name}</p>
              <div className="flex items-center justify-center mt-1">
                <Gem className="h-3 w-3 text-cyan-400 mr-1" />
                <span className="text-xs">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
        
        {isSpinning && (
          <Progress value={50} className="mb-6 animate-pulse" />
        )}
        
        <Button 
          className="w-full btn-primary"
          disabled={isSpinning || !canClaim || !user}
          onClick={claimReward}
        >
          {isSpinning 
            ? "Opening..." 
            : canClaim 
              ? "Claim Daily Reward" 
              : "Already Claimed"
          }
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground text-center">
        Claim your free case every 24 hours!
      </div>
    </Card>
  );
};

export default DailyFreeCase;
