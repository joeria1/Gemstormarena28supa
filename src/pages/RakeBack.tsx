
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { preventAutoScroll, disableScrollRestoration } from '@/utils/scrollFix';

const RakeBack = () => {
  const { user, updateBalance } = useUser();
  const [totalWagered, setTotalWagered] = useState(0);
  const [pendingRakeBack, setPendingRakeBack] = useState(0);
  const [claimLoading, setClaimLoading] = useState(false);
  
  // Prevent automatic scrolling
  useEffect(() => {
    preventAutoScroll();
    disableScrollRestoration();
    
    // Simulate fetching user's wagering data
    if (user) {
      const randomWagered = Math.floor(Math.random() * 100000) + 10000;
      setTotalWagered(randomWagered);
      
      // Calculate rake back at 0.05% rate
      const rakeBack = Math.floor(randomWagered * 0.0005);
      setPendingRakeBack(rakeBack);
    }
  }, [user]);
  
  const handleClaimRakeBack = () => {
    if (!user) {
      toast.error('Please login to claim rake back');
      return;
    }
    
    if (pendingRakeBack <= 0) {
      toast.error('No rake back available to claim');
      return;
    }
    
    setClaimLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Add rake back to user's balance
      updateBalance(pendingRakeBack);
      
      // Reset pending rake back
      setPendingRakeBack(0);
      
      toast.success(`Successfully claimed ${pendingRakeBack} gems rake back!`);
      setClaimLoading(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] bg-clip-text text-transparent">
            Rake Back Rewards
          </h1>
          <p className="text-muted-foreground mt-2">
            Earn gems back based on your total wagered amount
          </p>
        </div>
        
        <div className="bg-black/40 border border-primary/20 p-8 rounded-xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Wagered:</span>
                    <span className="flex items-center text-xl font-bold">
                      <Gem className="h-5 w-5 text-gem mr-1" />
                      {totalWagered.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rake Back Rate:</span>
                    <span className="text-xl font-bold text-green-400">0.05%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pending Rake Back:</span>
                    <span className="flex items-center text-xl font-bold">
                      <Gem className="h-5 w-5 text-green-400 mr-1" />
                      {pendingRakeBack.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleClaimRakeBack}
                disabled={claimLoading || pendingRakeBack <= 0 || !user}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-12"
              >
                {claimLoading ? 'Processing...' : `Claim ${pendingRakeBack.toLocaleString()} Gems`}
              </Button>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              
              <div className="space-y-4 text-sm">
                <div className="p-4 border border-dashed border-primary/30 rounded-lg">
                  <h3 className="font-semibold mb-1">Simple Rake Back System</h3>
                  <p className="text-muted-foreground">
                    You automatically earn 0.05% of your total wagered amount as rake back rewards.
                  </p>
                </div>
                
                <div className="p-4 border border-dashed border-primary/30 rounded-lg">
                  <h3 className="font-semibold mb-1">Accumulate and Claim</h3>
                  <p className="text-muted-foreground">
                    Your rake back rewards accumulate as you play games. Claim them anytime to receive gems directly into your balance.
                  </p>
                </div>
                
                <div className="p-4 border border-dashed border-primary/30 rounded-lg">
                  <h3 className="font-semibold mb-1">Example Calculation</h3>
                  <p className="text-muted-foreground">
                    If you wager 100,000 gems, you'll earn 50 gems in rake back rewards (100,000 × 0.05%).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RakeBack;
