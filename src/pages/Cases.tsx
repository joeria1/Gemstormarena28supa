import React, { useState } from 'react';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import ChatWindow from '@/components/Chat/ChatWindow';
import { SliderItem } from '@/types/slider';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gem, CreditCard, Star, Filter, Users } from 'lucide-react';

// Demo case items
const caseItems: Record<string, SliderItem[]> = {
  standard: [
    { id: '1', name: 'Common Knife', image: '/placeholder.svg', rarity: 'common', price: 50 },
    { id: '2', name: 'Forest Shield', image: '/placeholder.svg', rarity: 'uncommon', price: 150 },
    { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare', price: 500 },
    { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic', price: 1000 },
    { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary', price: 2500 },
    { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical', price: 5000 },
    { id: '7', name: 'Iron Dagger', image: '/placeholder.svg', rarity: 'common', price: 75 },
    { id: '8', name: 'Steel Hammer', image: '/placeholder.svg', rarity: 'uncommon', price: 200 },
    { id: '9', name: 'Mystic Staff', image: '/placeholder.svg', rarity: 'rare', price: 750 },
    { id: '10', name: 'Shadow Cloak', image: '/placeholder.svg', rarity: 'epic', price: 1500 }
  ],
  premium: [
    { id: '11', name: 'Celestial Bow', image: '/placeholder.svg', rarity: 'epic', price: 2000 },
    { id: '12', name: 'Phoenix Blade', image: '/placeholder.svg', rarity: 'legendary', price: 5000 },
    { id: '13', name: 'Cosmic Cleaver', image: '/placeholder.svg', rarity: 'mythical', price: 10000 },
    { id: '14', name: 'Starlight Dagger', image: '/placeholder.svg', rarity: 'rare', price: 1200 },
    { id: '15', name: 'Astral Shield', image: '/placeholder.svg', rarity: 'epic', price: 2500 },
    { id: '16', name: 'Lunar Mace', image: '/placeholder.svg', rarity: 'legendary', price: 6000 },
    { id: '17', name: 'Gravity Hammer', image: '/placeholder.svg', rarity: 'mythical', price: 12000 },
    { id: '18', name: 'Supernova Staff', image: '/placeholder.svg', rarity: 'legendary', price: 7500 }
  ],
  battle: [
    { id: '19', name: 'War Hammer', image: '/placeholder.svg', rarity: 'epic', price: 1800 },
    { id: '20', name: 'Battle Axe', image: '/placeholder.svg', rarity: 'rare', price: 900 },
    { id: '21', name: 'Commander Shield', image: '/placeholder.svg', rarity: 'legendary', price: 4500 },
    { id: '22', name: 'Tactical Knife', image: '/placeholder.svg', rarity: 'uncommon', price: 300 },
    { id: '23', name: 'Strategic Bow', image: '/placeholder.svg', rarity: 'rare', price: 1100 },
    { id: '24', name: 'General Sword', image: '/placeholder.svg', rarity: 'epic', price: 2200 },
    { id: '25', name: 'Emperor Blade', image: '/placeholder.svg', rarity: 'mythical', price: 8000 }
  ]
};

// Case prices
const casePrices = {
  standard: 100,
  premium: 500,
  battle: 250
};

// Case display names
const caseNames = {
  standard: 'Standard Case',
  premium: 'Premium Case',
  battle: 'Battle Case'
};

const Cases: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [activeCase, setActiveCase] = useState<string>('standard');
  const [lastWon, setLastWon] = useState<SliderItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeBattle, setActiveBattle] = useState<string | null>(null);
  const [battleWinners, setBattleWinners] = useState<Record<string, SliderItem>>({});
  
  // Demo battle data
  const battles = [
    { 
      id: 'battle-1', 
      name: '2-Way Battle',
      cost: 200,
      players: [
        { id: 'user-1', name: 'CryptoKing', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CryptoKing' },
        { id: 'user-2', name: 'waiting...', avatar: '/placeholder.svg' }
      ],
      caseType: 'standard',
      rounds: 3
    },
    { 
      id: 'battle-2', 
      name: '3-Way Premium',
      cost: 600,
      players: [
        { id: 'user-3', name: 'DiamondHands', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiamondHands' },
        { id: 'user-4', name: 'MoonShooter', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MoonShooter' },
        { id: 'user-5', name: 'waiting...', avatar: '/placeholder.svg' }
      ],
      caseType: 'premium',
      rounds: 2
    }
  ];

  // Handle case opening
  const openCase = () => {
    if (!user) {
      toast.error('Please login to open cases');
      return;
    }
    
    const casePrice = casePrices[activeCase as keyof typeof casePrices];
    
    if (user.balance < casePrice) {
      toast.error('Insufficient balance to open this case');
      return;
    }
    
    // Deduct case price
    updateBalance(-casePrice);
    setIsSpinning(true);
  };

  // Handle spin completion
  const handleSpinComplete = (item: SliderItem) => {
    setLastWon(item);
    updateBalance(item.price);
    
    // Show toast based on rarity
    if (item.rarity === 'legendary' || item.rarity === 'mythical') {
      toast.success(`Incredible! You won ${item.name}!`, {
        description: `Worth ${item.price} gems!`
      });
    } else if (item.rarity === 'epic') {
      toast.success(`Great pull! You won ${item.name}!`, {
        description: `Worth ${item.price} gems!`
      });
    } else {
      toast(`You won: ${item.name}!`, {
        description: `Worth ${item.price} gems!`
      });
    }
  };

  // Join a case battle
  const joinBattle = (battleId: string) => {
    if (!user) {
      toast.error('Please login to join battles');
      return;
    }
    
    const battle = battles.find(b => b.id === battleId);
    if (!battle) return;
    
    if (user.balance < battle.cost) {
      toast.error('Insufficient balance to join this battle');
      return;
    }
    
    // Deduct battle cost
    updateBalance(-battle.cost);
    
    // Set active battle
    setActiveBattle(battleId);
    
    // Mock battle progression
    toast.success(`You've joined the ${battle.name}!`, {
      description: "The battle will start shortly..."
    });
  };

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Cases & Battles
          </h1>
          <p className="text-muted-foreground mt-2">
            Open cases to win valuable items or join case battles against other players
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main case opening area */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="cases" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="cases" className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cases
                </TabsTrigger>
                <TabsTrigger value="battles" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Case Battles
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="cases" className="space-y-6 py-4">
                {/* Case selection */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.keys(caseItems).map(caseKey => (
                    <Card 
                      key={caseKey}
                      className={`bg-black/40 border cursor-pointer transition-all overflow-hidden ${
                        activeCase === caseKey 
                          ? 'border-primary shadow-lg shadow-primary/20' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => setActiveCase(caseKey)}
                    >
                      <div className="p-4 text-center">
                        <h3 className="font-medium text-sm md:text-base">{caseNames[caseKey as keyof typeof caseNames]}</h3>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Gem className="h-3 w-3 text-cyan-400" />
                          <span className="text-sm">{casePrices[caseKey as keyof typeof casePrices]}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {/* Case slider */}
                <Card className="bg-black/40 border-white/10 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{caseNames[activeCase as keyof typeof caseNames]}</h2>
                    <div className="text-muted-foreground flex items-center">
                      <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                      <span>{casePrices[activeCase as keyof typeof casePrices]}</span>
                    </div>
                  </div>
                  
                  <CaseSlider 
                    items={caseItems[activeCase]} 
                    onComplete={handleSpinComplete}
                    spinDuration={5000}
                    isSpinning={isSpinning}
                    setIsSpinning={setIsSpinning}
                  />
                  
                  <div className="mt-6 text-center">
                    <Button 
                      className="btn-primary"
                      onClick={openCase}
                      disabled={isSpinning || !user || (user && user.balance < casePrices[activeCase as keyof typeof casePrices])}
                    >
                      {isSpinning 
                        ? "Opening..." 
                        : `Open Case (${casePrices[activeCase as keyof typeof casePrices]} gems)`}
                    </Button>
                  </div>
                </Card>
                
                {/* Last won item */}
                {lastWon && (
                  <Card className="bg-black/40 border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4">Last Item Won</h2>
                    <div className="flex items-center gap-4">
                      <div 
                        className={`w-16 h-16 rounded bg-gradient-to-b p-2 
                          ${lastWon.rarity === 'common' ? 'from-gray-500 to-gray-400' : 
                            lastWon.rarity === 'uncommon' ? 'from-green-600 to-green-500' : 
                            lastWon.rarity === 'rare' ? 'from-blue-700 to-blue-600' :
                            lastWon.rarity === 'epic' ? 'from-purple-700 to-purple-600' :
                            lastWon.rarity === 'legendary' ? 'from-amber-600 to-amber-500' :
                            'from-red-700 to-red-600'}`
                        }
                      >
                        <img 
                          src={lastWon.image} 
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
                        <h3 className="text-white font-medium">{lastWon.name}</h3>
                        <p className={`text-sm font-bold capitalize ${
                          lastWon.rarity === 'common' ? 'text-gray-300' :
                          lastWon.rarity === 'uncommon' ? 'text-green-300' :
                          lastWon.rarity === 'rare' ? 'text-blue-300' :
                          lastWon.rarity === 'epic' ? 'text-purple-300' :
                          lastWon.rarity === 'legendary' ? 'text-amber-300' :
                          'text-red-300'
                        }`}>
                          {lastWon.rarity}
                        </p>
                        <div className="flex items-center mt-1">
                          <Gem className="h-3 w-3 text-cyan-400 mr-1" />
                          <span>{lastWon.price}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="battles" className="space-y-6 py-4">
                {/* Battle filters */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Active Battles</h2>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
                
                {/* Battle list */}
                {battles.map(battle => (
                  <Card 
                    key={battle.id} 
                    className={`bg-black/40 p-6 border ${
                      activeBattle === battle.id
                        ? 'border-primary'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        {battle.name}
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {battle.rounds}x {caseNames[battle.caseType as keyof typeof caseNames]}
                        </span>
                      </h3>
                      <div className="text-muted-foreground flex items-center">
                        <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                        <span>{battle.cost}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {battle.players.map((player, index) => (
                        <div 
                          key={player.id} 
                          className={`flex flex-col items-center p-3 rounded-lg ${
                            player.name === 'waiting...' 
                              ? 'border-2 border-dashed border-white/10' 
                              : 'bg-black/20 border border-white/10'
                          }`}
                        >
                          <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden mb-2">
                            <img 
                              src={player.avatar} 
                              alt={player.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium truncate w-full text-center">
                            {player.name}
                          </p>
                          {battleWinners[battle.id] && index === 0 && (
                            <div className="mt-1 flex items-center justify-center w-5 h-5 bg-amber-500/20 rounded-full">
                              <Star className="h-3 w-3 text-amber-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {activeBattle === battle.id ? (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground animate-pulse">
                          Battle in progress...
                        </p>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => joinBattle(battle.id)} 
                        className="w-full btn-primary"
                        disabled={!user || (user && user.balance < battle.cost)}
                      >
                        Join Battle
                      </Button>
                    )}
                  </Card>
                ))}
                
                <Card className="bg-black/40 border-white/10 p-6 flex flex-col items-center justify-center border-2 border-dashed">
                  <Button variant="outline" className="bg-transparent">
                    <Users className="mr-2 h-4 w-4" />
                    Create Your Own Battle
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Choose cases, set rounds, and invite friends
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Chat sidebar */}
          <div className="col-span-1">
            <ChatWindow className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cases;
