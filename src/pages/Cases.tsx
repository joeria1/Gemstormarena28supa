import React, { useState, useEffect } from 'react';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import ChatWindow from '@/components/Chat/ChatWindow';
import CaseBattleCreator from '@/components/CaseBattle/CaseBattleCreator';
import CaseBattlesList, { Battle } from '@/components/CaseBattle/CaseBattlesList';
import { SliderItem } from '@/types/slider';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gem, CreditCard, Star, Filter, Users, Swords } from 'lucide-react';
import { playButtonSound } from '@/utils/sounds';

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

// Special item: Reroll
const rerollItem: SliderItem = {
  id: 'reroll',
  name: 'Reroll',
  image: '/placeholder.svg',
  rarity: 'special',
  price: 0,
  isReroll: true
};

// Add reroll to all case types
Object.keys(caseItems).forEach(caseType => {
  caseItems[caseType].push(rerollItem);
});

const Cases: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [activeCase, setActiveCase] = useState<string>('standard');
  const [lastWon, setLastWon] = useState<SliderItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeBattle, setActiveBattle] = useState<string | null>(null);
  const [battleWinners, setBattleWinners] = useState<Record<string, SliderItem>>({});
  const [battles, setBattles] = useState<Battle[]>([]);
  const [mainTab, setMainTab] = useState('cases');
  const [battleTab, setBattleTab] = useState('join');
  
  // Initialize with demo battles
  useEffect(() => {
    const demoBattles: Battle[] = [
      { 
        id: 'battle-1', 
        type: '1v1',
        caseType: 'standard',
        rounds: 3,
        cursedMode: false,
        creator: {
          id: 'user-1',
          name: 'CryptoKing',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CryptoKing'
        },
        players: [
          { 
            id: 'user-1', 
            name: 'CryptoKing', 
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CryptoKing' 
          }
        ],
        maxPlayers: 2,
        cost: 300,
        status: 'waiting',
        createdAt: new Date(Date.now() - 300000)
      },
      { 
        id: 'battle-2', 
        type: '2v2',
        caseType: 'premium',
        rounds: 2,
        cursedMode: true,
        creator: {
          id: 'user-3',
          name: 'DiamondHands',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiamondHands'
        },
        players: [
          { 
            id: 'user-3', 
            name: 'DiamondHands', 
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiamondHands' 
          },
          { 
            id: 'user-4', 
            name: 'MoonShooter', 
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MoonShooter' 
          }
        ],
        maxPlayers: 4,
        cost: 1000,
        status: 'waiting',
        createdAt: new Date(Date.now() - 600000)
      }
    ];
    
    setBattles(demoBattles);
  }, []);

  // Handle case opening
  const openCase = () => {
    playButtonSound();
    
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
    if (item.isReroll) {
      // Handle reroll
      toast.success('Reroll! Rolling again for a better item!', {
        description: 'You will get at least an uncommon item!'
      });
      
      // Find items better than common
      const betterItems = caseItems[activeCase].filter(
        item => item.rarity !== 'common' && !item.isReroll
      );
      
      // Get a random better item
      const randomBetterItem = betterItems[Math.floor(Math.random() * betterItems.length)];
      
      // Trigger a new spin animation with a delay
      setTimeout(() => {
        setLastWon(randomBetterItem);
        updateBalance(randomBetterItem.price);
        showWinToast(randomBetterItem);
      }, 1000);
      
      return;
    }
    
    setLastWon(item);
    updateBalance(item.price);
    showWinToast(item);
  };
  
  // Show toast based on item rarity
  const showWinToast = (item: SliderItem) => {
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
    playButtonSound();
    
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
    
    // Update battle with new player
    const updatedBattles = battles.map(b => {
      if (b.id === battleId) {
        // Add user to players
        const updatedPlayers = [...b.players, {
          id: user.id,
          name: user.username,
          avatar: user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shiny'
        }];
        
        // Check if battle is ready to start
        const battleReady = updatedPlayers.length === b.maxPlayers;
        
        return {
          ...b,
          players: updatedPlayers,
          status: battleReady ? 'starting' as const : 'waiting' as const
        };
      }
      return b;
    });
    
    setBattles(updatedBattles);
    setActiveBattle(battleId);
    
    toast.success(`You've joined the ${battle.type} Battle!`, {
      description: "The battle will start when all slots are filled."
    });
    
    // Simulate battle starting if all slots are filled
    const updatedBattle = updatedBattles.find(b => b.id === battleId);
    if (updatedBattle && updatedBattle.status === 'starting') {
      setTimeout(() => {
        startBattle(battleId);
      }, 3000);
    }
  };
  
  // Create a case battle
  const createBattle = (battleData: Battle) => {
    // Add the battle to the list
    setBattles(prev => [battleData, ...prev]);
    
    // Deduct the cost from user balance
    if (user) {
      updateBalance(-battleData.cost);
    }
    
    // If the battle is starting immediately (with bots), start it
    if (battleData.status === 'in-progress' || battleData.status === 'starting') {
      setTimeout(() => {
        startBattle(battleData.id);
      }, 3000);
    }
    
    // Switch to join tab to see the created battle
    setBattleTab('join');
  };
  
  // Start a battle
  const startBattle = (battleId: string) => {
    // Update battle status to in-progress
    setBattles(prev => prev.map(b => 
      b.id === battleId ? { ...b, status: 'in-progress' } : b
    ));
    
    // Simulate battle results after a delay
    setTimeout(() => {
      // Determine winner randomly
      const battle = battles.find(b => b.id === battleId);
      if (!battle) return;
      
      const players = battle.players;
      const winnerIndex = Math.floor(Math.random() * players.length);
      const winner = players[winnerIndex];
      
      // Update battle status to completed and set winner
      setBattles(prev => prev.map(b => 
        b.id === battleId ? { 
          ...b, 
          status: 'completed', 
          winner: winner 
        } : b
      ));
      
      // If user is the winner, award them
      if (winner.id === user?.id) {
        const winnings = battle.cost * battle.maxPlayers;
        updateBalance(winnings);
        toast.success('You won the battle!', {
          description: `You've been awarded ${winnings} gems!`
        });
      }
    }, 10000); // Battle lasts 10 seconds
  };
  
  // Spectate a battle
  const spectateBattle = (battleId: string) => {
    setActiveBattle(battleId);
    toast('Spectating battle...');
  };

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            DUMP.FUN Cases
          </h1>
          <p className="text-muted-foreground mt-2">
            Open cases to win valuable items or join case battles against other players
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main case opening area */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="cases" className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cases
                </TabsTrigger>
                <TabsTrigger value="battles" className="flex-1">
                  <Swords className="h-4 w-4 mr-2" />
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
                <Tabs value={battleTab} onValueChange={setBattleTab} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="join">
                      Join Battle
                    </TabsTrigger>
                    <TabsTrigger value="create">
                      Create Battle
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="join" className="pt-6">
                    <CaseBattlesList 
                      battles={battles}
                      onJoinBattle={joinBattle}
                      onSpectate={spectateBattle}
                    />
                  </TabsContent>
                  
                  <TabsContent value="create" className="pt-6">
                    <CaseBattleCreator 
                      onBattleCreate={createBattle}
                    />
                  </TabsContent>
                </Tabs>
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
