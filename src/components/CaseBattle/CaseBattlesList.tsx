
import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Battle {
  id: string;
  type: string;
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
  status: string;
  createdAt: Date;
  cases: {
    id: string;
    name: string;
    image: string;
    price: number;
  }[];
}

interface CaseBattlesListProps {
  battles: Battle[];
  onJoinBattle: (battleId: string) => void;
  onSpectate: (battleId: string) => void;
}

const CaseBattlesList: React.FC<CaseBattlesListProps> = ({ battles, onJoinBattle, onSpectate }) => {
  if (battles.length === 0) {
    return (
      <Card className="p-6 bg-gray-800 text-center">
        <p className="text-gray-400">No active battles at the moment.</p>
        <p className="text-gray-400 mt-2">Create a new battle or check back later!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {battles.map((battle) => (
        <Card key={battle.id} className="bg-gray-800 text-white overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={battle.creator.avatar} />
                  <AvatarFallback>{battle.creator.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{battle.creator.name}'s Battle</div>
                  <div className="text-xs text-gray-400">{battle.type} - {battle.caseType}</div>
                </div>
              </div>
              <div className="px-2 py-1 bg-blue-600 rounded text-xs font-bold">
                ${battle.cost.toFixed(2)}
              </div>
            </div>
            
            <div className="flex justify-between my-3">
              <div className="text-sm text-gray-400">Players: {battle.players.length}/{battle.maxPlayers}</div>
              <div className="text-sm text-gray-400">Rounds: {battle.rounds}</div>
            </div>
            
            <div className="flex mt-2 justify-between">
              {battle.status === 'waiting' && battle.players.length < battle.maxPlayers ? (
                <Button 
                  onClick={() => onJoinBattle(battle.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Join Battle
                </Button>
              ) : (
                <Button 
                  onClick={() => onSpectate(battle.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Spectate
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CaseBattlesList;
