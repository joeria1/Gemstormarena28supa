
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Star, Users, Gem, User, Bot, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseBattlesListProps {
  onJoinBattle?: (battleId: string) => void;
  showHeader?: boolean;
}

interface BattleData {
  id: string;
  name: string;
  players: {
    name: string;
    avatar: string;
    isBot: boolean;
  }[];
  totalParticipants: number;
  slots: number;
  price: number;
  caseCount: number;
  status: 'waiting' | 'inProgress' | 'completed';
  winner?: string;
}

const mockBattles: BattleData[] = [
  {
    id: 'battle-1',
    name: 'High Roller Battle',
    players: [
      { name: 'Player1', avatar: '/placeholder.svg', isBot: false },
      { name: 'BotPlayer', avatar: '/placeholder.svg', isBot: true },
    ],
    totalParticipants: 2,
    slots: 2,
    price: 450,
    caseCount: 3,
    status: 'waiting',
  },
  {
    id: 'battle-2',
    name: 'Elite Battle',
    players: [
      { name: 'Player2', avatar: '/placeholder.svg', isBot: false },
    ],
    totalParticipants: 1,
    slots: 2,
    price: 300,
    caseCount: 2,
    status: 'waiting',
  },
  {
    id: 'battle-3',
    name: 'Budget Challenge',
    players: [
      { name: 'Player3', avatar: '/placeholder.svg', isBot: false },
      { name: 'BotPlayer', avatar: '/placeholder.svg', isBot: true },
    ],
    totalParticipants: 2,
    slots: 2,
    price: 150,
    caseCount: 2,
    status: 'inProgress',
  },
  {
    id: 'battle-4',
    name: 'VIP Battle',
    players: [
      { name: 'Player4', avatar: '/placeholder.svg', isBot: false },
      { name: 'Winner', avatar: '/placeholder.svg', isBot: true },
    ],
    totalParticipants: 2,
    slots: 2,
    price: 600,
    caseCount: 3,
    status: 'completed',
    winner: 'Winner',
  },
];

const CaseBattlesList: React.FC<CaseBattlesListProps> = ({ onJoinBattle, showHeader = true }) => {
  const [activeBattles, setActiveBattles] = useState<BattleData[]>(mockBattles);

  const handleJoinBattle = (battleId: string) => {
    if (onJoinBattle) {
      onJoinBattle(battleId);
    }
  };

  const handleSpectate = (battleId: string) => {
    console.log('Spectating battle:', battleId);
  };

  return (
    <div className="w-full">
      {showHeader && (
        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList className="grid grid-cols-3 h-12 bg-gray-800 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-base">All Battles</TabsTrigger>
            <TabsTrigger value="my" className="rounded-lg text-base">My Battles</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-base">History</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="space-y-4">
        {activeBattles.map((battle) => (
          <div 
            key={battle.id} 
            className={cn(
              "bg-gray-800/60 border border-gray-700 rounded-lg p-4 overflow-hidden transition-all",
              battle.status === 'completed' ? "opacity-70" : "hover:border-blue-500"
            )}
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {battle.name}
                      {battle.status === 'inProgress' && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500 text-blue-50 rounded-full animate-pulse">
                          LIVE
                        </span>
                      )}
                      {battle.status === 'completed' && (
                        <span className="px-2 py-0.5 text-xs bg-gray-500 text-gray-200 rounded-full">
                          ENDED
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-400 text-sm">
                        {battle.totalParticipants}/{battle.slots} Players
                      </span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">
                        {battle.caseCount} {battle.caseCount === 1 ? 'Case' : 'Cases'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Gem className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 font-bold">{battle.price}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 mb-3">
                  {battle.players.map((player, index) => (
                    <div key={index} className="flex items-center bg-gray-700 rounded-full pl-1 pr-3 py-1">
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800">
                          <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                        </div>
                        {player.isBot && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                            <Bot className="h-2 w-2 text-white" />
                          </div>
                        )}
                        {battle.status === 'completed' && battle.winner === player.name && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                            <Trophy className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="ml-1 text-sm text-white">{player.name}</span>
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: battle.slots - battle.players.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="flex items-center bg-gray-700/50 rounded-full pl-1 pr-3 py-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="ml-1 text-sm text-gray-500">Empty slot</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-row md:flex-col justify-end gap-2">
                {battle.status === 'waiting' && battle.players.length < battle.slots && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleJoinBattle(battle.id)}
                  >
                    Join Battle
                  </Button>
                )}
                
                {battle.status === 'inProgress' && (
                  <Button 
                    variant="outline" 
                    className="border-blue-500 text-blue-400"
                    onClick={() => handleSpectate(battle.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Spectate
                  </Button>
                )}
                
                {battle.status === 'completed' && (
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-400"
                    onClick={() => handleSpectate(battle.id)}
                  >
                    View Results
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseBattlesList;
