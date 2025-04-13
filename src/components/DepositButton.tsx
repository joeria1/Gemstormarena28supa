
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
import { CircleDollarSign, Bitcoin, Coins } from 'lucide-react';
import { playSound } from '../utils/soundEffects';
import { SOUNDS } from '../utils/soundEffects';
import { toast } from '../hooks/use-toast';

const cryptoOptions = [
  { name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  { name: 'Ethereum', symbol: 'ETH', icon: Bitcoin, address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
  { name: 'Litecoin', symbol: 'LTC', icon: Bitcoin, address: 'LQ3V8Gkci9UuxZGvdFUi4DNXPyShMKPnxi' },
];

// Function to get free gems
const getFreeDailyGems = () => {
  const lastClaimedDate = localStorage.getItem('lastClaimedDate');
  const today = new Date().toDateString();

  if (lastClaimedDate !== today) {
    localStorage.setItem('lastClaimedDate', today);
    
    // Get current gems or default to 0
    const currentGems = parseInt(localStorage.getItem('userGems') || '0');
    const freeGems = 100;
    
    // Add gems to user's account
    localStorage.setItem('userGems', (currentGems + freeGems).toString());
    
    playSound(SOUNDS.REWARD);
    toast({
      title: 'Daily Gems Claimed!',
      description: `You've received ${freeGems} free gems!`,
      variant: 'default',
    });
    
    return freeGems;
  } else {
    toast({
      title: 'Already Claimed',
      description: 'You've already claimed your free gems today. Come back tomorrow!',
      variant: 'default',
    });
    return 0;
  }
};

const DepositButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleDeposit = () => {
    playSound(SOUNDS.DEPOSIT);
    setOpen(false);
    toast({
      title: 'Deposit Initiated',
      description: 'Please send the exact amount to the displayed address.',
      variant: 'default',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-primary text-background hover:bg-primary/90"
        >
          <CircleDollarSign className="mr-2 h-4 w-4" />
          <span>Deposit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
            <TabsTrigger value="free">Free Gems</TabsTrigger>
          </TabsList>
          <TabsContent value="crypto" className="space-y-4">
            <div className="space-y-4">
              {cryptoOptions.map((crypto) => (
                <div 
                  key={crypto.symbol}
                  className="flex flex-col space-y-2 rounded-md border p-4"
                >
                  <div className="flex items-center space-x-2">
                    <crypto.icon className="h-5 w-5" />
                    <span className="font-medium">{crypto.name} ({crypto.symbol})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      readOnly
                      value={crypto.address}
                      className="w-full bg-muted px-3 py-2 text-sm rounded-md"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(crypto.address);
                        toast({ 
                          title: 'Address Copied',
                          description: `${crypto.symbol} address copied to clipboard.`,
                          variant: 'default',
                          duration: 3000,
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <Button onClick={handleDeposit}>
                    Deposit with {crypto.symbol}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="free" className="space-y-4">
            <div className="rounded-md border p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Coins className="h-16 w-16 text-yellow-500" />
                <h3 className="text-xl font-bold">Free Daily Gems</h3>
                <p className="text-center text-muted-foreground">
                  Claim 100 free gems daily to try out our platform!
                </p>
                <Button onClick={() => getFreeDailyGems()} size="lg">
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
