
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EnhancedCaseBattleCreator from '@/components/CaseBattle/EnhancedCaseBattleCreator';
import CaseBattlesList, { Battle, BattleParticipant } from '@/components/CaseBattle/CaseBattlesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, PlusSquare, Rocket, Users, Gem, ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { SliderItem } from '@/types/slider';
import { useUser } from '@/context/UserContext';
import { playButtonSound } from "@/utils/sounds";
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { useChat } from '@/context/ChatContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  const [mainTab, setMainTab] = useState('caseBattles');
  const [battleTab, setBattleTab] = useState('join');
  const [showBattleCreator, setShowBattleCreator] = useState(false);
  const [activeBattleView, setActiveBattleView] = useState<Battle | null>(null);
  const { toggleChat } = useChat();
  const [affiliateCode, setAffiliateCode] = useState(user?.id ? `${user.id.substring(0, 8)}` : 'NOTLOGGEDIN');
  const [affiliateInput, setAffiliateInput] = useState('');

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
        createdAt: new Date(Date.now() - 300000),
        cases: [
          { id: 'case1', name: 'Standard Case', image: '/placeholder.svg', price: 100 },
          { id: 'case2', name: 'Premium Case', image: '/placeholder.svg', price: 500 },
          { id: 'case1', name: 'Standard Case', image: '/placeholder.svg', price: 100 },
        ]
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
        createdAt: new Date(Date.now() - 600000),
        cases: [
          { id: 'case2', name: 'Premium Case', image: '/placeholder.svg', price: 500 },
          { id: 'case2', name: 'Premium Case', image: '/placeholder.svg', price: 500 },
        ]
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

  const copyAffiliateCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    toast.success("Affiliate code copied to clipboard!");
  };

  const redeemAffiliateCode = () => {
    if (affiliateInput.trim() === '') {
      toast.error("Please enter an affiliate code");
      return;
    }
    
    if (affiliateInput.trim() === affiliateCode) {
      toast.error("You can't redeem your own affiliate code");
      return;
    }
    
    toast.success(`Affiliate code ${affiliateInput} redeemed!`);
    toast("You've earned 500 gems!");
    updateBalance(500);
    setAffiliateInput('');
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
              {activeBattleView.cursedMode && (
                <Badge variant="destructive" className="ml-2 bg-red-900/50">
                  Cursed Mode
                </Badge>
              )}
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
                    
                    {index > 0 && index < activeBattleView.maxPlayers && index % 2 === 1 && (
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Case Battles</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setMainTab('cases')}
          >
            <span>Open Cases</span>
          </Button>
          <Button 
            size="sm" 
            onClick={() => {
              setMainTab('caseBattles');
              setShowBattleCreator(true);
            }}
            className={`bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white flex items-center gap-2`}
          >
            <PlusSquare className="h-4 w-4" />
            <span>Create Battle</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="join" className="w-full" onValueChange={(value) => setBattleTab(value)}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="join">Join Battles</TabsTrigger>
            <TabsTrigger value="create">Create Battle</TabsTrigger>
            <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
          </TabsList>
          
          {user && (
            <div className="flex items-center bg-gray-800 rounded-md px-3 py-1.5 border border-gray-700">
              <Gem className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-white font-bold">{user.balance}</span>
            </div>
          )}
        </div>

        <TabsContent value="join" className="space-y-4">
          <div className="grid grid-cols-1 gap-8">
            <CaseBattlesList 
              battles={battles} 
              onJoinBattle={handleJoinBattle} 
              onSpectate={handleSpectateBattle} 
            />
          </div>
        </TabsContent>

        <TabsContent value="create">
          {showBattleCreator ? (
            <EnhancedCaseBattleCreator />
          ) : (
            <div className="text-center py-20">
              <Button 
                onClick={() => setShowBattleCreator(true)} 
                className="bg-green-600 hover:bg-green-700"
              >
                <PlusSquare className="h-5 w-5 mr-2" />
                Create a New Battle
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="affiliate">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Affiliate Program</h2>
              <p className="mb-6 text-gray-200">
                Share your affiliate code with friends and earn 5% of their deposits. 
                When they use your code, you both get bonus gems!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Your Affiliate Code</h3>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-800 border border-gray-700 rounded-l-md p-4 font-mono text-xl text-center">
                      {affiliateCode}
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-l-none h-full bg-gray-700 border border-gray-600"
                      onClick={copyAffiliateCode}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-300">
                    Share this code to earn 5% of your referrals' deposits
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Redeem Code</h3>
                  <div className="flex items-center">
                    <Input
                      placeholder="Enter affiliate code"
                      value={affiliateInput}
                      onChange={(e) => setAffiliateInput(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button 
                      variant="default"
                      className="rounded-l-none h-full"
                      onClick={redeemAffiliateCode}
                    >
                      Redeem
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-300">
                    Get 500 gems when you redeem an affiliate code
                  </p>
                </div>
              </div>
              
              <div className="mt-8 bg-blue-950/50 border border-blue-800 rounded-md p-4">
                <h4 className="font-bold mb-2">Affiliate Benefits</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                  <li>Earn 5% of all deposits made by your referrals</li>
                  <li>Your referrals get 5% bonus on their first deposit</li>
                  <li>Track your earnings in real-time</li>
                  <li>Instant payouts to your balance</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Cases;
