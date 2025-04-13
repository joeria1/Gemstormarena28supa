
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Clock, Crown, Plus, Users, Bot, Dice1, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

// Battle participant interface
export interface BattleParticipant {
  id: string;
  name: string;
  username: string;
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
  status: 'waiting' | 'starting' | 'in-progress' | 'completed';
  winner?: BattleParticipant;
  createdAt: Date;
  cases?: {
    id: string;
    name: string;
    image: string;
    price: number;
  }[];
}

// Battle list component props
interface BattleListProps {
  battles: Battle[];
  onJoinBattle: (battleId: string) => void;
  onSpectate: (battleId: string) => void;
}

const CaseBattlesList: React.FC<BattleListProps> = ({ battles = [], onJoinBattle, onSpectate }) => {
  const { user } = useUser();
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [activeBattleView, setActiveBattleView] = useState<Battle | null>(null);

  const handleJoinBattle = (battleId: string) => {
    if (!user) {
      toast.error('You need to log in to join a battle');
      return;
    }
    onJoinBattle(battleId);
  };

  const handleSpectate = (battleId: string) => {
    onSpectate(battleId);
    const battle = battles.find(b => b.id === battleId);
    if (battle) {
      setActiveBattleView(battle);
    }
  };

  if (activeBattleView) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => setActiveBattleView(null)}>
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
          </div>

          <div className="grid grid-cols-4 gap-4 mb-10">
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
                          <Plus className="mr-1 h-3 w-3" />
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
    );
  }

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
                      onClick={() => handleSpectate(battle.id)}
                    >
                      View Battle
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
    </div>
  );
};

export default CaseBattlesList;
