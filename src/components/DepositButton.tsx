
import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CircleDollarSign, Bitcoin, Coins, Info, CopyIcon } from 'lucide-react';
import { useSound } from './ui/sound-context';
import { toast } from '../hooks/use-toast';
import { useUser } from '../context/UserContext';

const cryptoOptions = [
  { name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  { name: 'Ethereum', symbol: 'ETH', icon: Bitcoin, address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
  { name: 'Litecoin', symbol: 'LTC', icon: Bitcoin, address: 'LQ3V8Gkci9UuxZGvdFUi4DNXPyShMKPnxi' },
];

// Function to get free gems
const getFreeDailyGems = (updateUserBalance: (amount: number) => void) => {
  const lastClaimedDate = localStorage.getItem('lastClaimedDate');
  const today = new Date().toDateString();

  if (lastClaimedDate !== today) {
    localStorage.setItem('lastClaimedDate', today);
    
    const freeGems = 100;
    
    // Add gems to user's account using context
    updateUserBalance(freeGems);
    
    toast({
      title: 'Daily Gems Claimed!',
      description: `You've received ${freeGems} free gems!`,
      variant: 'default',
    });
    
    return freeGems;
  } else {
    toast({
      title: 'Already Claimed',
      description: "You've already claimed your free gems today. Come back tomorrow!",
      variant: 'default',
    });
    return 0;
  }
};

const DepositButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { playSound } = useSound();
  const { updateBalance } = useUser();

  const handleDeposit = () => {
    playSound('/sounds/deposit.mp3');
    setOpen(false);
    toast({
      title: 'Deposit Initiated',
      description: 'Please send the exact amount to the displayed address.',
      variant: 'default',
    });
  };
  
  const handleCopy = (address: string, symbol: string) => {
    navigator.clipboard.writeText(address);
    toast({ 
      title: 'Address Copied',
      description: `${symbol} address copied to clipboard.`,
      variant: 'default',
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-primary text-white hover:bg-primary/90 shadow-lg"
        >
          <CircleDollarSign className="mr-2 h-4 w-4" />
          <span>Deposit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Deposit Funds</DialogTitle>
        </DialogHeader>
        
        {/* Conversion Rate Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-md p-4 mb-4 flex items-center gap-3">
          <Info className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-200">Conversion Rate</p>
            <p className="text-sm">
              5.2 euros = 1,000 gems
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="free">Free Gems</TabsTrigger>
          </TabsList>
          <TabsContent value="crypto" className="space-y-4">
            <div className="space-y-4">
              {cryptoOptions.map((crypto) => (
                <div 
                  key={crypto.symbol}
                  className="flex flex-col space-y-3 rounded-md border border-white/10 p-4 bg-black/40"
                >
                  <div className="flex items-center space-x-2">
                    <crypto.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{crypto.name} ({crypto.symbol})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative w-full">
                      <input
                        readOnly
                        value={crypto.address}
                        className="w-full bg-black/60 px-3 py-2 text-sm rounded-md border border-white/10"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => handleCopy(crypto.address, crypto.symbol)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleDeposit}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Deposit with {crypto.symbol}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="free" className="space-y-4">
            <div className="rounded-md border border-primary/30 bg-black/40 p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Coins className="h-16 w-16 text-yellow-500" />
                <h3 className="text-xl font-bold">Free Daily Gems</h3>
                <p className="text-center text-muted-foreground">
                  Claim 100 free gems daily to try out our platform!
                </p>
                <Button 
                  onClick={() => getFreeDailyGems(updateBalance)} 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Claim Free Gems
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DepositButton;
