
import React, { useState } from "react";
import CaseSlider from "@/components/CaseSlider/CaseSlider";
import { SliderItem } from "@/types/slider";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gem, Loader2 } from "lucide-react";

// Sample cases with different types and price ranges
const availableCases = [
  {
    id: 'basic',
    name: 'Basic Case',
    price: 300,
    image: '/placeholder.svg',
    items: [
      { id: '1', name: 'Common Sword', image: '/placeholder.svg', rarity: 'common' as const, price: 100 },
      { id: '2', name: 'Forest Shield', image: '/placeholder.svg', rarity: 'uncommon' as const, price: 250 },
      { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare' as const, price: 500 },
      { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic' as const, price: 1000 },
    ]
  },
  {
    id: 'premium',
    name: 'Premium Case',
    price: 500,
    image: '/placeholder.svg',
    items: [
      { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare' as const, price: 500 },
      { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic' as const, price: 1000 },
      { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary' as const, price: 2500 },
      { id: '9', name: 'Mystic Staff', image: '/placeholder.svg', rarity: 'rare' as const, price: 500 },
    ]
  },
  {
    id: 'legendary',
    name: 'Legendary Case',
    price: 1000,
    image: '/placeholder.svg',
    items: [
      { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary' as const, price: 2500 },
      { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
      { id: '10', name: 'Shadow Cloak', image: '/placeholder.svg', rarity: 'epic' as const, price: 1000 },
    ]
  },
  {
    id: 'mythical',
    name: 'Mythical Case',
    price: 2000,
    image: '/placeholder.svg',
    items: [
      { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
      { id: '11', name: 'Eternal Flame', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
      { id: '12', name: 'Cosmic Shard', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
    ]
  }
];

const Cases: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [selectedCase, setSelectedCase] = useState(availableCases[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWon, setLastWon] = useState<SliderItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCaseSelect = (caseId: string) => {
    const selectedCase = availableCases.find(c => c.id === caseId);
    if (selectedCase) {
      setSelectedCase(selectedCase);
    }
  };
  
  const handleOpenCase = () => {
    if (!user) {
      toast.error("Please login to open a case");
      return;
    }
    
    if (user.balance < selectedCase.price) {
      toast.error(`Insufficient balance. You need ${selectedCase.price} gems to open this case`);
      return;
    }
    
    setIsLoading(true);
    
    // Deduct the cost of the case
    updateBalance(-selectedCase.price);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSpinning(true);
      toast.success(`Opening ${selectedCase.name}...`);
    }, 500);
  };
  
  const handleSpinComplete = (item: SliderItem) => {
    setLastWon(item);
    updateBalance(item.price);
    toast.success(`You won ${item.name} worth ${item.price} gems!`);
  };
  
  // Helper functions for color classes
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
  
  const getRarityTextColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-200';
      case 'uncommon': return 'text-green-300';
      case 'rare': return 'text-blue-300';
      case 'epic': return 'text-purple-300';
      case 'legendary': return 'text-amber-300';
      case 'mythical': return 'text-red-300';
      default: return 'text-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4066FF] to-primary bg-clip-text text-transparent">
            Open Cases
          </h1>
          <p className="text-muted-foreground mt-2">
            Try your luck with our collection of exciting cases
          </p>
        </div>
        
        <Tabs defaultValue="open" className="mb-8">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-black/90 border border-white/10">
            <TabsTrigger value="open" className="text-lg py-3 data-[state=active]:bg-primary/50 text-white">
              Open Cases
            </TabsTrigger>
            <TabsTrigger value="battle" className="text-lg py-3 data-[state=active]:bg-primary/50 text-white">
              Case Battles
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="open" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableCases.map(caseItem => (
                <div
                  key={caseItem.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCase.id === caseItem.id 
                      ? 'scale-105 bg-primary/20 border-primary' 
                      : 'bg-black/40 border-white/10 hover:border-primary/50'
                  } border rounded-lg p-3 flex flex-col items-center`}
                  onClick={() => handleCaseSelect(caseItem.id)}
                >
                  <div className="w-16 h-16 mb-2 rounded bg-gradient-to-b from-primary/20 to-black p-2">
                    <img
                      src={caseItem.image}
                      alt={caseItem.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-center">{caseItem.name}</h3>
                  <div className="flex items-center mt-1">
                    <Gem className="h-3 w-3 text-gem mr-1" />
                    <span className="text-sm">{caseItem.price}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-black/40 border border-white/10 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">{selectedCase.name} Contents</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedCase.items.map(item => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-2 bg-gradient-to-b ${getRarityColorClass(item.rarity)} bg-opacity-10`}
                  >
                    <div className="w-full aspect-square mb-2 flex items-center justify-center">
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
                    <h4 className="font-medium text-sm text-center truncate">{item.name}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-xs ${getRarityTextColor(item.rarity)} font-semibold`}>
                        {item.rarity}
                      </span>
                      <div className="flex items-center">
                        <Gem className="h-3 w-3 text-gem mr-0.5" />
                        <span className="text-xs">{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Case Price</p>
                  <div className="flex items-center">
                    <Gem className="h-4 w-4 text-gem mr-1" />
                    <span className="font-bold">{selectedCase.price}</span>
                  </div>
                </div>
                
                <Button
                  className="btn-primary"
                  disabled={isSpinning || isLoading || !user || (user && user.balance < selectedCase.price)}
                  onClick={handleOpenCase}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : isSpinning ? (
                    "Spinning..."
                  ) : (
                    "Open Case"
                  )}
                </Button>
              </div>
            </div>
            
            {isSpinning && (
              <div className="mt-6">
                <CaseSlider
                  items={selectedCase.items}
                  onComplete={handleSpinComplete}
                  isSpinning={isSpinning}
                  setIsSpinning={setIsSpinning}
                  options={{
                    duration: 7000,
                    itemSize: 'medium'
                  }}
                />
              </div>
            )}
            
            {lastWon && (
              <Card className="bg-black/40 border-white/10 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-2 text-white">Last Item Won:</h2>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded bg-gradient-to-b p-2 ${getRarityColorClass(lastWon.rarity)}`}>
                      <img 
                        src={lastWon.image || '/placeholder.svg'} 
                        alt={lastWon.name} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/placeholder.svg';
                        }} 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{lastWon.name}</h3>
                      <p className={`text-sm font-bold capitalize ${getRarityTextColor(lastWon.rarity)}`}>
                        {lastWon.rarity}
                      </p>
                      <div className="flex items-center mt-1">
                        <Gem className="h-3.5 w-3.5 text-gem mr-1" />
                        <span className="text-sm text-white">{lastWon.price}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="battle" className="space-y-6">
            <div className="text-center p-6 border border-dashed border-white/20 rounded-lg bg-black/40">
              <h2 className="text-xl mb-2">Case Battles Coming Soon</h2>
              <p className="text-muted-foreground">
                Compete with other players in exciting case battles. This feature is coming soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Cases;
