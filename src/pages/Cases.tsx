import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CaseBattleCreator from '@/components/CaseBattle/CaseBattleCreator';
import CaseBattlesList, { Battle, BattleParticipant } from '@/components/CaseBattle/CaseBattlesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, PlusSquare, Rocket, Users, Gem, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SliderItem } from '@/types/slider';
import { useUser } from '@/context/UserContext';
import { playButtonSound } from "@/utils/sounds";
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { useChat } from '@/context/ChatContext';

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

const casePrices = {
  standard: 100,
  premium: 500,
  battle: 250
};

const caseNames = {
  standard: 'Standard Case',
  premium: 'Premium Case',
  battle: 'Battle Case'
};

const rerollItem: SliderItem = {
  id: 'reroll',
  name: 'Reroll',
  image: '/placeholder.svg',
  rarity: 'special',
  price: 0,
  isReroll: true
};

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
  const [showBattleCreator, setShowBattleCreator] = useState(false);
  const [activeBattleView, setActiveBattleView] = useState<Battle | null>(null);
  const { toggleChat } = useChat();

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
          username: 'CryptoKing',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CryptoKing'
        },
        players: [
          { 
            id: 'user-1', 
            name: 'CryptoKing',
            username: 'CryptoKing',
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
          username: 'DiamondHands',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiamondHands'
        },
        players: [
          { 
            id: 'user-3',
            name: 'DiamondHands',
            username: 'DiamondHands',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiamondHands' 
          },
          { 
            id: 'user-4',
            name: 'MoonShooter',
            username: 'MoonShooter',
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
    
    updateBalance(-casePrice);
    setIsSpinning(true);
  };

  const handleSpinComplete = (item: SliderItem) => {
    if (item.isReroll) {
      toast.success('Reroll! Rolling again for a better item!', {
        description: 'You will get at least an uncommon item!'
      });
      
      const betterItems = caseItems[activeCase].filter(
        item => item.rarity !== 'common' && !item.isReroll
      );
      
      const randomBetterItem = betterItems[Math.floor(Math.random() * betterItems.length)];
      
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

  const handleJoinBattle = (battleId: string) => {
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
    
    updateBalance(-battle.cost);
    
    const updatedBattles = battles.map(b => {
      if (b.id === battleId) {
        const updatedPlayers = [...b.players, {
          id: user.id,
          name: user.username,
          username: user.username,
          avatar: user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shiny'
        }];
        
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
    
    const foundBattle = updatedBattles.find(b => b.id === battleId);
    if (foundBattle) {
      setActiveBattleView(foundBattle);
      
      if (foundBattle.status === 'starting') {
        setTimeout(() => {
          startBattle(battleId);
        }, 3000);
      }
    }
    
    toast.success(`You've joined the ${battle.type} Battle!`, {
      description: "The battle will start when all slots are filled."
    });
  };

  const createBattle = (battleData: Battle) => {
    setBattles(prev => [battleData, ...prev]);
    
    if (user) {
      updateBalance(-battleData.cost);
    }
    
    setShowBattleCreator(false);
    
    setActiveBattleView(battleData);
    
    if (battleData.status === 'in-progress' || battleData.status === 'starting') {
      setTimeout(() => {
        startBattle(battleData.id);
      }, 3000);
    }
  };

  const startBattle = (battleId: string) => {
    setBattles(prev => prev.map(b => 
      b.id === battleId ? { ...b, status: 'in-progress' as const } : b
    ));
    
    const updatedBattle = battles.find(b => b.id === battleId);
    if (updatedBattle) {
      setActiveBattleView({
        ...updatedBattle,
        status: 'in-progress' as const
      });
    }
    
    setTimeout(() => {
      const battle = battles.find(b => b.id === battleId);
      if (!battle) return;
      
      const players = battle.players;
      const winnerIndex = Math.floor(Math.random() * players.length);
      const winner = players[winnerIndex];
      
      const updatedBattles = battles.map(b => 
        b.id === battleId ? { 
          ...b, 
          status: 'completed' as const, 
          winner: winner 
        } : b
      );
      
      setBattles(updatedBattles);
      
      if (activeBattleView && activeBattleView.id === battleId) {
        setActiveBattleView({
          ...activeBattleView,
          status: 'completed' as const,
          winner: winner
        });
      }
      
      if (winner.id === user?.id) {
        const winnings = battle.cost * battle.maxPlayers;
        updateBalance(winnings);
        toast.success('You won the battle!', {
          description: `You've been awarded ${winnings} gems!`
        });
      }
    }, 10000);
  };

  const handleSpectateBattle = (battleId: string) => {
    const battle = battles.find(b => b.id === battleId);
    if (battle) {
      setActiveBattleView(battle);
    }
  };

  if (activeBattleView) {
    return (
      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => setActiveBattleView(null)} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Battles
            </Button>
            <h2 className="text-xl font-bold">{activeBattleView.type} Battle</h2>
            <div className="flex items-center">
              <span className="font-bold mr-2">Total Value</span>
              <div className="bg-black/40 px-3 py-1.5 rounded-md flex items-center">
                <span className="text-yellow-400 font-bold">
                  {activeBattleView.cost * activeBattleView.maxPlayers}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-blue-950 to-black/90 rounded-xl p-6 border border-blue-900/50">
            <div className="flex justify-between items-center mb-8">
              <div className="bg-green-600/20 text-green-400 border border-green-600/30 px-4 py-1 rounded-md">
                {activeBattleView.type}
              </div>
              <div className="text-white/70 text-sm">
                {activeBattleView.rounds} Rounds • {activeBattleView.caseType} Case
              </div>
              <div className="text-white/70 text-sm">
                Waiting for players ({activeBattleView.players.length}/{activeBattleView.maxPlayers})
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {Array.from({ length: activeBattleView.maxPlayers }).map((_, index) => {
                const player = activeBattleView.players[index];
                
                return (
                  <div key={index} className="relative">
                    <div className="bg-blue-950/60 rounded-lg border border-blue-900/50 overflow-hidden">
                      <div className="flex items-center gap-2 p-3 border-b border-blue-900/50">
                        <div className="flex items-center gap-2">
                          {player ? (
                            <>
                              <img 
                                src={player.avatar} 
                                alt={player.name} 
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="text-white">0</div>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                                <span className="text-blue-400">?</span>
                              </div>
                              <div className="text-white">0</div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="h-40 flex items-center justify-center">
                        {player ? (
                          <div className="text-xs text-blue-400">Waiting to open cases...</div>
                        ) : (
                          <div className="text-xs text-blue-400">Empty slot</div>
                        )}
                      </div>
                      
                      <div className="p-3 border-t border-blue-900/50">
                        {player ? (
                          <div className="text-sm text-center text-blue-300">
                            {player.name}
                          </div>
                        ) : (
                          <Button 
                            className="w-full bg-green-500 hover:bg-green-600"
                            onClick={() => handleJoinBattle(activeBattleView.id)}
                          >
                            <PlusSquare className="mr-1 h-3 w-3" />
                            Join Battle
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {index > 0 && index < activeBattleView.maxPlayers && index % 2 === 1 && activeBattleView.maxPlayers > 2 && (
                      <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 z-10">
                        <div className="bg-blue-800 text-blue-200 px-2 py-1 rounded text-xs font-bold">
                          VS
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        
        <Tabs defaultValue="cases" className="w-full" onValueChange={value => setMainTab(value)}>
          <TabsList className="grid grid-cols-3 mb-6 w-full sm:w-[400px]">
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="battles">Battles</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cases" className="space-y-6 py-4">
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
          
          <TabsContent value="battles">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Case Battles</h2>
              <Button onClick={() => setShowBattleCreator(true)}>
                <PlusSquare className="mr-2 h-4 w-4" />
                Create Battle
              </Button>
            </div>

            <CaseBattlesList 
              battles={battles} 
              onJoinBattle={handleJoinBattle} 
              onSpectate={handleSpectateBattle} 
            />
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card className="bg-black/40 border-white/10 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Inventory</h2>
                <div className="text-muted-foreground flex items-center">
                  <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                  <span>0</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  className="btn-primary"
                  onClick={() => setShowBattleCreator(true)}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Create Battle
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showBattleCreator} onOpenChange={setShowBattleCreator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Battle</DialogTitle>
            <DialogDescription>
              Create a new battle to challenge other players.
            </DialogDescription>
          </DialogHeader>
          <CaseBattleCreator onBattleCreate={createBattle} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cases;
