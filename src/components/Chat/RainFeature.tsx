
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';

interface RainFeatureProps {
  isOpen: boolean;
}

const RainFeature: React.FC<RainFeatureProps> = ({ isOpen }) => {
  const { user, updateBalance } = useUser();
  const [timeUntilRain, setTimeUntilRain] = useState<number>(900); // 15 minutes in seconds
  const [rainActive, setRainActive] = useState<boolean>(false);
  const [lastRainTime, setLastRainTime] = useState<number>(0);
  const [rainAmount, setRainAmount] = useState<number>(100);
  const [customRainAmount, setCustomRainAmount] = useState<number>(100);

  // Timer for scheduled rain
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const timeSinceLastRain = now - lastRainTime;
      
      if (timeSinceLastRain >= 900) { // 15 minutes
        // Time for a new rain!
        if (!rainActive) {
          startRain(rainAmount);
          setLastRainTime(now);
        }
      } else {
        setTimeUntilRain(900 - timeSinceLastRain);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRainTime, rainActive, rainAmount]);

  // Start a rain event
  const startRain = (amount: number) => {
    setRainActive(true);
    
    // Show toast notification regardless of chat state
    toast.success(`It's raining! ${amount} gems are up for grabs!`, {
      duration: 10000,
    });
    
    // End rain after 30 seconds
    setTimeout(() => {
      setRainActive(false);
      toast.info('Rain has ended. Be ready for the next one!');
    }, 30000);
  };

  // Start a custom rain event
  const startCustomRain = () => {
    if (!user) {
      toast.error('Please login to start a rain');
      return;
    }
    
    if (user.balance < customRainAmount) {
      toast.error('Insufficient balance');
      return;
    }
    
    // Deduct gems from user's balance
    updateBalance(-customRainAmount);
    
    // Start the rain
    startRain(customRainAmount);
    setLastRainTime(Math.floor(Date.now() / 1000));
    
    toast.success(`You started a rain of ${customRainAmount} gems!`);
  };

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle rain claim
  const claimRain = () => {
    if (!user) {
      toast.error('Please login to claim rain');
      return;
    }
    
    if (!rainActive) {
      toast.error('There is no active rain to claim');
      return;
    }
    
    // Calculate a random amount between 5-20% of the rain
    const minPercent = 5;
    const maxPercent = 20;
    const percent = minPercent + Math.floor(Math.random() * (maxPercent - minPercent + 1));
    
    const claimAmount = Math.floor((rainAmount * percent) / 100);
    updateBalance(claimAmount);
    
    toast.success(`You claimed ${claimAmount} gems from the rain!`);
  };

  // Process command
  const processRainCommand = (message: string) => {
    // Check if message is a rain command
    if (message.startsWith('/rain ')) {
      const amount = parseInt(message.split(' ')[1]);
      
      if (isNaN(amount) || amount <= 0) {
        toast.error('Invalid rain amount');
        return true;
      }
      
      setCustomRainAmount(amount);
      startCustomRain();
      return true;
    }
    
    return false;
  };

  return (
    <div className={`rain-feature ${!isOpen ? 'fixed bottom-20 right-4 z-50 bg-black/80 p-3 rounded-lg border border-primary/30' : ''}`}>
      <div className="mb-2">
        {rainActive ? (
          <div className="text-center">
            <div className="text-green-400 mb-2 font-bold">
              ☔ IT'S RAINING! ☔
            </div>
            <Button 
              onClick={claimRain}
              className="w-full bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] text-white"
            >
              <Gem className="w-4 h-4 mr-2" />
              Claim Rain Gems
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Next Rain:</span>
              <span className="text-sm font-semibold">{formatTime(timeUntilRain)}</span>
            </div>
            
            {isOpen && (
              <div className="mb-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={customRainAmount}
                    onChange={(e) => setCustomRainAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="bg-black/50 border border-primary/30 rounded p-1 text-sm w-20"
                    min="1"
                  />
                  <Button 
                    onClick={startCustomRain} 
                    variant="outline" 
                    size="sm"
                    disabled={!user || user.balance < customRainAmount}
                  >
                    Start Rain
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Or type "/rain [amount]" in chat
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RainFeature;
