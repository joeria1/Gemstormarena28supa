
import React from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { playButtonSound } from "@/utils/sounds";
import { toast } from "sonner";
import { Filter, Users, Star, Play, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  isBot?: boolean;
}

export interface Battle {
  id: string;
  type: string;
  caseType: string;
  rounds: number;
  cursedMode: boolean;
  creator: Player;
  players: Player[];
  maxPlayers: number;
  cost: number;
  status: 'waiting' | 'starting' | 'in-progress' | 'completed';
  createdAt: Date;
  winner?: Player;
}

interface CaseBattlesListProps {
  battles: Battle[];
  onJoinBattle: (battleId: string) => void;
  onSpectate: (battleId: string) => void;
}

const CaseBattlesList: React.FC<CaseBattlesListProps> = ({ 
  battles, 
  onJoinBattle,
  onSpectate
}) => {
  const { user } = useUser();
  
  const handleJoin = (battleId: string, cost: number) => {
    playButtonSound();
    
    if (!user) {
      toast.error('Please login to join battles');
      return;
    }
    
    if (user.balance < cost) {
      toast.error(`Insufficient balance. You need ${cost} gems.`);
      return;
    }
    
    onJoinBattle(battleId);
  };
  
  const getCaseTypeName = (caseType: string): string => {
    switch(caseType) {
      case 'standard': return 'Standard Case';
      case 'premium': return 'Premium Case';
      case 'battle': return 'Battle Case';
      default: return 'Unknown Case';
    }
  };

  if (battles.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
        <p className="text-muted-foreground">No active battles at the moment. Create one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Active Battles</h3>
        <Button variant="outline" size="sm" className="flex items-center gap-1 bg-black/60">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      
      {battles.map(battle => (
        <Card 
          key={battle.id}
          className={`bg-black/40 p-6 border ${
            battle.cursedMode 
              ? 'border-red-500/30' 
              : battle.status === 'in-progress' 
                ? 'border-primary/30 bg-primary/5'
                : 'border-white/10'
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{battle.type} Battle</h3>
                  {battle.cursedMode && (
                    <Badge variant="destructive" className="text-xs">CURSED</Badge>
                  )}
                  {battle.status === 'in-progress' && (
                    <Badge className="bg-primary/80 text-xs">LIVE</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{battle.rounds}x {getCaseTypeName(battle.caseType)}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                  <span>{battle.cost} gems</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {battle.status === 'waiting' && (
                  <Button 
                    onClick={() => handleJoin(battle.id, battle.cost)} 
                    disabled={!user || (user && user.balance < battle.cost) || battle.players.some(p => p.id === user?.id)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Join
                  </Button>
                )}
                
                {battle.status === 'in-progress' && (
                  <Button 
                    onClick={() => onSpectate(battle.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Play className="h-3 w-3 mr-1" /> Watch
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: battle.maxPlayers }).map((_, index) => {
                const player = battle.players[index];
                return (
                  <div 
                    key={index} 
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      !player 
                        ? 'border-2 border-dashed border-white/10' 
                        : player.isBot 
                          ? 'bg-red-500/10 border border-red-500/20'
                          : 'bg-black/20 border border-white/10'
                    }`}
                  >
                    {player ? (
                      <>
                        <Avatar className="h-12 w-12 mb-2">
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-xs font-medium truncate w-full text-center">
                          {player.name}
                        </div>
                        {player.isBot && (
                          <Badge variant="outline" className="mt-1 text-[10px] border-red-500/30 text-red-500">BOT</Badge>
                        )}
                        {battle.winner?.id === player.id && (
                          <div className="mt-1 flex items-center justify-center w-5 h-5 bg-amber-500/20 rounded-full">
                            <Star className="h-3 w-3 text-amber-400" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Users className="h-5 w-5 text-white/20 mb-1" />
                        <span className="text-xs text-white/40">Waiting...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {battle.status === 'starting' && (
              <div className="text-center mt-1">
                <span className="text-sm text-primary/80 flex items-center justify-center gap-1">
                  <RotateCw className="h-3 w-3 animate-spin" />
                  Battle starting...
                </span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CaseBattlesList;
