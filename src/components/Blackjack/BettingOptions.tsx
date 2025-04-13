
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gem } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';

// Predefined bet amounts
const BET_AMOUNTS = [25, 100, 250, 500];

interface BettingOptionsProps {
  currentBet: number;
  onBetChange: (amount: number) => void;
  isGameActive: boolean;
}

const BettingOptions: React.FC<BettingOptionsProps> = ({ 
  currentBet, 
  onBetChange,
  isGameActive 
}) => {
  const { user } = useUser();
  
  const handleSetBet = (amount: number) => {
    if (!user) {
      toast.error('Please log in to place bets');
      return;
    }
    
    if (isGameActive) {
      toast.error('Cannot change bet during active game');
      return;
    }
    
    if (amount > (user?.balance || 0)) {
      toast.error('Insufficient balance for this bet');
      return;
    }
    
    onBetChange(amount);
    toast.success(`Bet set to ${amount} gems`);
  };
  
  const handleClearBet = () => {
    if (isGameActive) {
      toast.error('Cannot clear bet during active game');
      return;
    }
    
    onBetChange(0);
  };
  
  const handleDoubleBet = () => {
    if (!user) {
      toast.error('Please log in to place bets');
      return;
    }
    
    if (isGameActive) {
      toast.error('Cannot change bet during active game');
      return;
    }
    
    const newBet = currentBet * 2;
    
    if (newBet > (user?.balance || 0)) {
      toast.error('Insufficient balance to double bet');
      return;
    }
    
    onBetChange(newBet);
    toast.success(`Bet doubled to ${newBet} gems`);
  };

  return (
    <div className="bg-black/40 rounded-xl p-4 border border-white/10">
      <h3 className="text-lg font-medium mb-3">Betting Options</h3>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold flex items-center">
          <Gem className="h-5 w-5 text-cyan-400 mr-2" />
          {currentBet}
        </div>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearBet}
            disabled={currentBet === 0 || isGameActive}
            className="border-red-500/50 hover:bg-red-500/20 text-red-400"
          >
            Clear
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDoubleBet}
            disabled={currentBet === 0 || isGameActive || (user && currentBet * 2 > user.balance)}
          >
            Double
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {BET_AMOUNTS.map(amount => (
          <Button
            key={amount}
            variant={currentBet === amount ? "default" : "outline"}
            className={currentBet === amount ? "bg-primary" : "bg-black/30"}
            onClick={() => handleSetBet(amount)}
            disabled={isGameActive || (user && amount > user.balance)}
          >
            {amount}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BettingOptions;
