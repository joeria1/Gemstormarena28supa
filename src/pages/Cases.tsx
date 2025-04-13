
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, PlusSquare, Rocket, Users, Gem, ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { SliderItem } from '@/types/slider';
import { useUser } from '@/context/UserContext';
import { playButtonSound } from "@/utils/sounds";
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { useChat } from '@/context/ChatContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ImprovedCaseBattleCreator from '@/components/CaseBattle/ImprovedCaseBattleCreator';
import CaseBattlesList from '@/components/CaseBattle/CaseBattlesList';
import ImprovedCaseBattleGame from '@/components/CaseBattle/ImprovedCaseBattleGame';

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

// Add reroll item to all case types
Object.keys(caseItems).forEach(caseType => {
  caseItems[caseType].push(rerollItem);
});

type Battle = {
  id: string;
  type: '1v1' | '2v2' | '1v1v1' | '1v1v1v1';
  caseType: string;
  rounds: number;
  cursedMode: boolean;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  players: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  }[];
  maxPlayers: number;
  cost: number;
  status: 'waiting' | 'starting' | 'in-progress' | 'completed';
  createdAt: Date;
  winner?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  cases: {
    id: string;
    name: string;
    image: string;
    price: number;
  }[];
};

const Cases: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [activeCase, setActiveCase] = useState<string>('standard');
  const [lastWon, setLastWon] = useState<SliderItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeBattle, setActiveBattle] = useState<string | null>(null);
  const [battleWinners, setBattleWinners] = useState<Record<string, SliderItem>>({});
  const [battles, setBattles] = useState<Battle[]>([]);
  const [mainTab, setMainTab] = useState('cases'); // Changed default to 'cases'
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
    setIsSpinning(false);
    
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
    
    // Update battles with the new player
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

  const createBattle = (battleData: any) => {
    const newBattle: Battle = {
      id: `battle-${Date.now()}`,
      type: battleData.mode,
      caseType: 'standard',
      rounds: battleData.cases.length,
      cursedMode: false,
      creator: {
        id: user.id,
        name: user.username,
        username: user.username,
        avatar: user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Creator'
      },
      players: [{
        id: user.id,
        name: user.username,
        username: user.username,
        avatar: user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Creator'
      }],
      maxPlayers: battleData.mode === '1v1' ? 2 : (battleData.mode === '2v2' ? 4 : (battleData.mode === '1v1v1' ? 3 : 4)),
      cost: battleData.totalCost,
      status: 'waiting',
      createdAt: new Date(),
      cases: battleData.cases
    };
    
    setBattles(prev => [newBattle, ...prev]);
    
    if (user) {
      updateBalance(-battleData.totalCost);
    }
    
    setShowBattleCreator(false);
    setActiveBattleView(newBattle);
    
    toast.success("Battle created successfully!");
  };

  const startBattle = (battleId: string) => {
    setBattles(prev => prev.map(b => 
      b.id === battleId ? { ...b, status: 'in-progress' as const } : b
    ));
    
    const updatedBattle = battles.find(b => b.id === battleId);
    if (updatedBattle) {
      setActiveBattleView({
        ...updatedBattle,
        status: 'in-progress'
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
          status: 'completed',
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

  // Render the active battle view
  if (activeBattleView) {
    return (
      <div className="container py-8">
        <ImprovedCaseBattleGame
          battle={{
            id: activeBattleView.id,
            creator: activeBattleView.creator,
            mode: activeBattleView.type,
            totalValue: activeBattleView.cost * activeBattleView.maxPlayers,
            cases: activeBattleView.rounds,
            players: activeBattleView.players.map(p => ({
              username: p.username,
              avatar: p.avatar,
              team: activeBattleView.type === '2v2' ? 
                (activeBattleView.players.indexOf(p) < 2 ? 1 : 2) : 
                activeBattleView.players.indexOf(p) + 1
            })),
            status: activeBattleView.status,
            createdAt: activeBattleView.createdAt,
            winnerId: activeBattleView.winner?.id
          }}
          onClose={() => setActiveBattleView(null)}
          currentUser={user.username}
        />
      </div>
    );
  }

  // Main render for cases
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cases & Battles</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant={mainTab === 'cases' ? "default" : "outline"} 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setMainTab('cases')}
          >
            <span>Open Cases</span>
          </Button>
          <Button 
            variant={mainTab === 'caseBattles' ? "default" : "outline"}
            size="sm" 
            onClick={() => setMainTab('caseBattles')}
            className="flex items-center gap-2"
          >
            <span>Case Battles</span>
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

      {mainTab === 'cases' && (
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue={activeCase} onValueChange={(value) => setActiveCase(value)}>
            <TabsList className="grid grid-cols-3 w-[300px] mb-6">
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
              <TabsTrigger value="battle">Battle</TabsTrigger>
            </TabsList>
            
            {Object.keys(caseItems).map((caseType) => (
              <TabsContent key={caseType} value={caseType}>
                <div className="bg-gradient-to-b from-blue-950 to-black/90 rounded-xl p-6 border border-blue-900/50">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{caseNames[caseType as keyof typeof caseNames]}</h2>
                    <p className="text-gray-400 mt-1">
                      Price: <span className="text-yellow-400 font-bold">${casePrices[caseType as keyof typeof casePrices]}</span>
                    </p>
                  </div>
                
                  <div className="relative mb-6 h-44">
                    {isSpinning ? (
                      <CaseSlider 
                        items={caseItems[caseType]} 
                        onComplete={handleSpinComplete}
                      />
                    ) : (
                      <div className="grid grid-cols-5 gap-2 h-full">
                        {caseItems[caseType].slice(0, 5).map((item) => (
                          <div 
                            key={item.id} 
                            className={`
                              bg-gray-800 p-2 rounded flex flex-col items-center justify-between
                              ${item.rarity === 'legendary' ? 'ring-2 ring-yellow-500' : ''}
                              ${item.rarity === 'mythical' ? 'ring-2 ring-purple-500' : ''}
                            `}
                          >
                            <div className="font-bold text-xs mb-1 truncate w-full text-center">
                              {item.name}
                            </div>
                            <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center mb-1">
                              <img src={item.image} alt={item.name} className="max-w-full max-h-full" />
                            </div>
                            <div className={`text-xs px-2 py-0.5 rounded ${
                              item.rarity === 'common' ? 'bg-gray-600' :
                              item.rarity === 'uncommon' ? 'bg-blue-600' :
                              item.rarity === 'rare' ? 'bg-purple-600' :
                              item.rarity === 'epic' ? 'bg-yellow-600' :
                              item.rarity === 'legendary' ? 'bg-yellow-500' :
                              'bg-red-600'
                            }`}>
                              {item.rarity.toUpperCase()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      size="lg" 
                      onClick={openCase}
                      disabled={isSpinning}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                    >
                      {isSpinning ? 'Opening...' : 'Open Case'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {mainTab === 'caseBattles' && (
        <div>
          <Tabs defaultValue={battleTab} onValueChange={(value) => setBattleTab(value)}>
            <TabsList className="grid grid-cols-3 w-[400px] mb-6">
              <TabsTrigger value="join">Join Battles</TabsTrigger>
              <TabsTrigger value="create">Create Battle</TabsTrigger>
              <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="join" className="space-y-4">
              {battles.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {battles.map(battle => (
                    <Card key={battle.id} className="bg-gray-900 border-gray-800 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-2">
                            <img 
                              src={battle.creator.avatar} 
                              alt={battle.creator.name} 
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{battle.creator.name}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(battle.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="bg-blue-900/30 text-blue-400 border border-blue-800/40 rounded px-3 py-1 text-sm font-medium">
                            {battle.type}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {battle.rounds} rounds
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Total Value</p>
                          <p className="font-bold text-yellow-500">${battle.cost * battle.maxPlayers}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Players</p>
                          <p className="font-medium">{battle.players.length}/{battle.maxPlayers}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          {battle.players.length < battle.maxPlayers ? (
                            <Button 
                              onClick={() => handleJoinBattle(battle.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Join (${battle.cost})
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleSpectateBattle(battle.id)}
                              variant="outline"
                            >
                              Spectate
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900 rounded-lg">
                  <p className="text-gray-400">No battles available. Create one!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="create">
              {showBattleCreator ? (
                <ImprovedCaseBattleCreator 
                  onCreateBattle={createBattle}
                  onCancel={() => setShowBattleCreator(false)}
                  userBalance={user.balance}
                />
              ) : (
                <div className="text-center py-20 bg-gray-900 rounded-lg">
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
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Cases;

