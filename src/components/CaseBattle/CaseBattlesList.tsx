
import React from 'react';
import { Button } from "../ui/button";
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

// Battle participant interface
export interface BattleParticipant {
  id: string;
  name: string;
  username: string;
  avatar: string;
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
  const handleJoinBattle = (battleId: string) => {
    onJoinBattle(battleId);
    toast.success("Joining battle...");
  };

  const handleSpectate = (battleId: string) => {
    onSpectate(battleId);
    toast.info("Spectating battle...");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {battles.map((battle) => (
        <Card key={battle.id} className="p-4 bg-gray-800 border-gray-700 shadow-lg overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <Badge variant="outline" className="bg-blue-900 text-blue-300">
              {battle.type}
            </Badge>
            <Badge variant="outline" className={battle.status === 'waiting' ? 'bg-green-900 text-green-300' : 'bg-amber-900 text-amber-300'}>
              {battle.status === 'waiting' ? 'Waiting' : 'In Progress'}
            </Badge>
          </div>
          
          <div className="mb-3">
            <h3 className="font-bold text-lg">{battle.caseType} Battle</h3>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{battle.rounds} rounds</span>
              <span>{battle.players.length}/{battle.maxPlayers} players</span>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3">
              <img 
                src={battle.creator.avatar} 
                alt={battle.creator.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium">{battle.creator.name}</div>
              <div className="text-xs text-gray-400">Creator</div>
            </div>
          </div>
          
          {battle.cases && battle.cases.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Cases:</div>
              <div className="flex gap-2 overflow-x-auto">
                {battle.cases.map((caseItem, index) => (
                  <div key={index} className="w-12 h-12 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center p-2">
                    <img 
                      src={caseItem.image} 
                      alt={caseItem.name}
                      className="max-w-full max-h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-yellow-400 font-bold">
              ${battle.cost.toFixed(2)}
            </div>
            
            <div className="flex gap-2">
              {battle.status === 'in-progress' ? (
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={() => handleSpectate(battle.id)}
                >
                  Spectate
                </Button>
              ) : battle.players.length < battle.maxPlayers ? (
                <Button 
                  size="sm"
                  onClick={() => handleJoinBattle(battle.id)}
                >
                  Join Battle
                </Button>
              ) : (
                <Button size="sm" disabled>
                  Full
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
      
      {battles.length === 0 && (
        <div className="col-span-full text-center py-12 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold mb-2">No active battles</h3>
          <p className="text-gray-400">Be the first to create a new case battle!</p>
        </div>
      )}
    </div>
  );
};

export default CaseBattlesList;
