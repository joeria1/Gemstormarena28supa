
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Clock, Crown, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

// Battle participant interface
interface BattleParticipant {
  id: string;
  username: string;
  name: string; // Alias for username
  avatar: string;
  rewards?: {
    id: string;
    name: string;
    image: string;
    value: number;
  }[];
  isBot?: boolean;
}

// Export the Battle interface for use in other components
export interface Battle {
  id: string;
  type: string;
  caseType: string;
  rounds: number;
  cursedMode: boolean;
  creator: BattleParticipant;
  players: BattleParticipant[];
  maxPlayers: number;
  cost: number;
  status: 'waiting' | 'in-progress' | 'completed';
  winner?: BattleParticipant;
  createdAt: Date;
  cases?: {
    id: string;
    name: string;
    image: string;
    price: number;
  }[];
}

// Old CaseBattle interface for backward compatibility
interface CaseBattle {
  id: string;
  creatorId: string;
  cases: {
    id: string;
    name: string;
    image: string;
    price: number;
  }[];
  participants: BattleParticipant[];
  maxParticipants: number;
  totalValue: number;
  status: 'waiting' | 'in-progress' | 'completed';
  winner?: BattleParticipant;
  createdAt: Date;
}

// Battle list component props
interface BattleListProps {
  battles: Battle[];
  onJoinBattle: (battleId: string) => void;
  onSpectate: (battleId: string) => void;
}

// Mock data
const demoRewards = [
  { id: 'reward1', name: 'Dragon Lore', image: '/placeholder.svg', value: 5000 },
  { id: 'reward2', name: 'Karambit Fade', image: '/placeholder.svg', value: 2500 },
  { id: 'reward3', name: 'AK-47 Wild Lotus', image: '/placeholder.svg', value: 1750 },
  { id: 'reward4', name: 'AWP Gungnir', image: '/placeholder.svg', value: 3200 },
];

const demoCases = [
  { id: 'case1', name: 'Premium Case', image: '/placeholder.svg', price: 500 },
  { id: 'case2', name: 'Luxury Case', image: '/placeholder.svg', price: 1000 },
  { id: 'case3', name: 'Elite Case', image: '/placeholder.svg', price: 2000 },
];

// Mock battle data
const mockBattles: Battle[] = [
  {
    id: 'battle1',
    type: '2v2',
    caseType: 'Premium',
    rounds: 3,
    cursedMode: false,
    creator: {
      id: 'user1',
      username: 'CryptoKing',
      name: 'CryptoKing',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CryptoKing',
    },
    players: [
      {
        id: 'user1',
        username: 'CryptoKing',
        name: 'CryptoKing',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CryptoKing',
      }
    ],
    maxPlayers: 4,
    cost: 500,
    status: 'waiting',
    createdAt: new Date(),
    cases: demoCases,
  },
  {
    id: 'battle2',
    type: '1v1',
    caseType: 'Luxury',
    rounds: 2,
    cursedMode: true,
    creator: {
      id: 'user2',
      username: 'DiamondHands',
      name: 'DiamondHands',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiamondHands',
    },
    players: [
      {
        id: 'user2',
        username: 'DiamondHands',
        name: 'DiamondHands',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiamondHands',
      },
      {
        id: 'user3',
        username: 'MoonShooter',
        name: 'MoonShooter',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MoonShooter',
        isBot: true,
      }
    ],
    maxPlayers: 2,
    cost: 1000,
    status: 'in-progress',
    createdAt: new Date(),
    cases: demoCases,
  },
  {
    id: 'battle3',
    type: '2v2',
    caseType: 'Elite',
    rounds: 5,
    cursedMode: false,
    creator: {
      id: 'user4',
      username: 'SatoshiLover',
      name: 'SatoshiLover',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SatoshiLover',
    },
    players: [
      {
        id: 'user4',
        username: 'SatoshiLover',
        name: 'SatoshiLover',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SatoshiLover',
      },
      {
        id: 'user5',
        username: 'GemCollector',
        name: 'GemCollector',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GemCollector',
      }
    ],
    maxPlayers: 4,
    cost: 2000,
    status: 'waiting',
    createdAt: new Date(),
    cases: demoCases,
  }
];

const CaseBattlesList: React.FC<BattleListProps> = ({ battles = mockBattles, onJoinBattle, onSpectate }) => {
  const { user } = useUser();
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);

  const handleJoinBattle = (battleId: string) => {
    if (!user) {
      toast.error('You need to log in to join a battle');
      return;
    }
    onJoinBattle(battleId);
  };

  const handleSpectate = (battleId: string) => {
    onSpectate(battleId);
  };

  const addBot = (battle: Battle) => {
    if (!user) {
      toast.error('You need to log in to add a bot');
      return;
    }

    // Create a bot player
    const botId = `bot-${Date.now()}`;
    const botNames = ['CryptoBot', 'DiamondBot', 'MoonBot', 'SatoshiBot', 'GemBot'];
    const randomBotName = botNames[Math.floor(Math.random() * botNames.length)];
    
    const newBot: BattleParticipant = {
      id: botId,
      username: randomBotName,
      name: randomBotName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${randomBotName}`,
      isBot: true
    };
    
    // Clone the battle and add the bot
    const updatedBattle = {
      ...battle,
      players: [...battle.players, newBot]
    };
    
    // For demo purposes, just update the UI
    toast.success(`${randomBotName} joined the battle!`);
    
    // In a real app, you would call an API here
    // For now, we'll just update our local state
    setSelectedBattle(updatedBattle as Battle);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="active">Active Battles</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="my">My Battles</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="w-full">
          <ScrollArea className="h-[500px] w-full pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {battles.filter(battle => battle.status !== 'completed').map((battle) => (
                <Card key={battle.id} className="bg-black/40 border-primary/20 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {battle.type}
                      </Badge>
                      <Badge variant="outline" className="ml-2 bg-black/50">
                        {battle.rounds} Rounds
                      </Badge>
                      {battle.cursedMode && (
                        <Badge variant="destructive" className="ml-2 bg-red-900/50">
                          Cursed Mode
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(battle.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={battle.creator.avatar} alt={battle.creator.name} />
                        <AvatarFallback>{battle.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{battle.creator.name}</p>
                        <p className="text-xs text-muted-foreground">Creator</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{battle.cost * battle.rounds} Gems</p>
                      <p className="text-xs text-muted-foreground">Total Value</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {battle.cases && battle.cases.slice(0, 5).map((caseItem, index) => (
                      <div key={index} className="aspect-square rounded-md bg-primary/10 p-1 flex items-center justify-center">
                        <img 
                          src={caseItem.image} 
                          alt={caseItem.name} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm">{battle.players.length}/{battle.maxPlayers}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {battle.status === 'in-progress' ? (
                        <Button 
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => handleSpectate(battle.id)}
                        >
                          Spectate
                        </Button>
                      ) : (
                        <Button 
                          className="text-xs h-8"
                          onClick={() => handleJoinBattle(battle.id)}
                          disabled={battle.players.length >= battle.maxPlayers || 
                            battle.players.some(p => p.id === user?.id)}
                        >
                          Join Battle
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed">
          <ScrollArea className="h-[500px] w-full pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {battles.filter(battle => battle.status === 'completed').map((battle) => (
                <Card key={battle.id} className="bg-black/40 border-primary/20 p-4">
                  {/* Display completed battles similar to active ones */}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {battle.type}
                      </Badge>
                      <Badge variant="outline" className="ml-2 bg-black/50">
                        {battle.rounds} Rounds
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-green-900/50 text-green-400">
                      Completed
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2 ring-2 ring-yellow-500">
                        <AvatarImage src={battle.winner?.avatar || ''} alt={battle.winner?.name || ''} />
                        <AvatarFallback>{battle.winner?.name[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium">{battle.winner?.name || 'Unknown'}</p>
                          <Crown className="h-4 w-4 text-yellow-500 ml-1" />
                        </div>
                        <p className="text-xs text-green-400">Winner</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{battle.cost * battle.rounds} Gems</p>
                      <p className="text-xs text-muted-foreground">Total Value</p>
                    </div>
                  </div>

                  <Button 
                    variant="outline"
                    className="w-full text-xs h-8"
                    onClick={() => handleSpectate(battle.id)}
                  >
                    View Results
                  </Button>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="my">
          <ScrollArea className="h-[500px] w-full pr-4">
            {user ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {battles.filter(battle => battle.players.some(p => p.id === user.id)).map((battle) => (
                  <Card key={battle.id} className="bg-black/40 border-primary/20 p-4">
                    {/* Display user's battles similar to active ones */}
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {battle.type}
                        </Badge>
                        <Badge variant="outline" className="ml-2 bg-black/50">
                          {battle.rounds} Rounds
                        </Badge>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          battle.status === 'completed' 
                            ? "bg-green-900/50 text-green-400"
                            : battle.status === 'in-progress'
                              ? "bg-amber-900/50 text-amber-400"
                              : "bg-blue-900/50 text-blue-400"
                        }
                      >
                        {battle.status === 'completed' ? 'Completed' : 
                         battle.status === 'in-progress' ? 'In Progress' : 'Waiting'}
                      </Badge>
                    </div>

                    <Button 
                      variant="outline"
                      className="w-full text-xs h-8"
                      onClick={() => battle.status === 'waiting' 
                        ? handleJoinBattle(battle.id) 
                        : handleSpectate(battle.id)
                      }
                    >
                      {battle.status === 'waiting' ? 'Join Battle' : 'View Battle'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Please log in to see your battles</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Battle Detail Dialog */}
      <Dialog open={!!selectedBattle} onOpenChange={() => setSelectedBattle(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Battle Details</DialogTitle>
            <DialogDescription>
              View battle information and participants
            </DialogDescription>
          </DialogHeader>

          {selectedBattle && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{selectedBattle.type} Battle</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedBattle.rounds} rounds with {selectedBattle.caseType} cases
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{selectedBattle.cost * selectedBattle.rounds} Gems</p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {selectedBattle.players.map((player, index) => (
                  <div key={index} className="bg-black/40 p-3 rounded-md">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium truncate">{player.name}</p>
                        {player.isBot && (
                          <Badge variant="outline" className="text-xs">Bot</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: selectedBattle.maxPlayers - selectedBattle.players.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="bg-black/20 p-3 rounded-md border border-dashed border-white/10 flex items-center justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-auto p-1 text-xs"
                      onClick={() => addBot(selectedBattle)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Bot
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium mb-2">Cases</h4>
                <div className="grid grid-cols-5 gap-2">
                  {selectedBattle.cases && selectedBattle.cases.map((caseItem, index) => (
                    <div key={index} className="aspect-square bg-primary/10 rounded-md p-2 flex flex-col items-center justify-between">
                      <img src={caseItem.image} alt={caseItem.name} className="w-full h-2/3 object-contain" />
                      <p className="text-xs text-center truncate w-full">{caseItem.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedBattle(null)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleJoinBattle(selectedBattle.id);
                    setSelectedBattle(null);
                  }}
                  disabled={selectedBattle.players.some(p => p.id === user?.id) || 
                    selectedBattle.players.length >= selectedBattle.maxPlayers}
                >
                  Join Battle
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseBattlesList;
