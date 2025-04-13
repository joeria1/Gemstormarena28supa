import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, ChevronLeft, Sword, DollarSign, Trophy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Player {
  username: string;
  avatar: string;
  team: number;
}

interface Battle {
  id: string;
  creator: {
    username: string;
    avatar: string;
  };
  mode: string;
  totalValue: number;
  cases: number;
  players: Player[];
  status: 'waiting' | 'in-progress' | 'completed';
  createdAt: Date;
  winnerId?: string;
}

interface CaseItem {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
}

interface ImprovedCaseBattleGameProps {
  battle: Battle;
  onClose: () => void;
  currentUser: string;
}

const generateRandomCaseItems = (count: number): CaseItem[] => {
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
  const rarityValues = {
    common: { min: 0.5, max: 5 },
    uncommon: { min: 3, max: 15 },
    rare: { min: 10, max: 30 },
    epic: { min: 25, max: 100 },
    legendary: { min: 75, max: 300 }
  };
  
  return Array.from({ length: count }, (_, i) => {
    const rarity = rarities[Math.floor(Math.random() * (rarities.length - 0.7))];
    const minValue = rarityValues[rarity].min;
    const maxValue = rarityValues[rarity].max;
    const value = Number((Math.random() * (maxValue - minValue) + minValue).toFixed(2));
    
    return {
      id: `item-${i}`,
      name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Item`,
      rarity,
      value
    };
  });
};

const ImprovedCaseBattleGame: React.FC<ImprovedCaseBattleGameProps> = ({ battle, onClose, currentUser }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentCase, setCurrentCase] = useState(0);
  const [playerResults, setPlayerResults] = useState<Record<string, CaseItem[]>>({});
  const [teamTotals, setTeamTotals] = useState<Record<number, number>>({});
  const [winningTeam, setWinningTeam] = useState<number | null>(null);
  const { user, updateUser } = useContext(UserContext);
  
  useEffect(() => {
    const initialResults: Record<string, CaseItem[]> = {};
    battle.players.forEach(player => {
      initialResults[player.username] = [];
    });
    setPlayerResults(initialResults);
    
    if (battle.status === 'in-progress') {
      startSpinning();
    }
  }, [battle]);
  
  const startSpinning = () => {
    setIsSpinning(true);
    spinCases();
  };
  
  const spinCases = () => {
    let caseIndex = 0;
    const totalCases = battle.cases;
    
    const spinInterval = setInterval(() => {
      if (caseIndex >= totalCases) {
        clearInterval(spinInterval);
        finishBattle();
        return;
      }
      
      setCurrentCase(caseIndex);
      
      const updatedResults = { ...playerResults };
      battle.players.forEach(player => {
        const caseItem = generateRandomCaseItems(1)[0];
        updatedResults[player.username] = [
          ...updatedResults[player.username],
          caseItem
        ];
      });
      
      setPlayerResults(updatedResults);
      caseIndex++;
    }, 3000);
    
    return () => clearInterval(spinInterval);
  };
  
  const finishBattle = () => {
    setIsSpinning(false);
    
    const totals: Record<number, number> = {};
    battle.players.forEach(player => {
      const playerTotal = playerResults[player.username]?.reduce((sum, item) => sum + item.value, 0) || 0;
      totals[player.team] = (totals[player.team] || 0) + playerTotal;
    });
    setTeamTotals(totals);
    
    let highestValue = 0;
    let winner: number | null = null;
    
    Object.entries(totals).forEach(([team, total]) => {
      if (total > highestValue) {
        highestValue = total;
        winner = parseInt(team);
      }
    });
    
    setWinningTeam(winner);
    
    if (user.team === winner) {
      const winnings = battle.totalValue * 0.95;
      updateUser({
        ...user,
        balance: user.balance + winnings
      });
      toast.success(`You won $${winnings.toFixed(2)}!`);
    }
  };
  
  const recreateBattle = () => {
    const initialResults: Record<string, CaseItem[]> = {};
    battle.players.forEach(player => {
      initialResults[player.username] = [];
    });
    setPlayerResults(initialResults);
    setTeamTotals({});
    setWinningTeam(null);
    setCurrentCase(0);
    
    startSpinning();
  };
  
  const getPlayerTotal = (username: string) => {
    return playerResults[username]?.reduce((sum, item) => sum + item.value, 0) || 0;
  };
  
  const getRarityColorClass = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-blue-500';
      case 'rare': return 'bg-purple-500';
      case 'epic': return 'bg-yellow-500';
      case 'legendary': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to lobby
          </Button>
          
          <div className="flex items-center">
            <Sword className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="font-bold text-white text-lg">{battle.mode}</h2>
          </div>
          
          <div className="flex items-center">
            <p className="text-gray-400 mr-2">Total Value</p>
            <div className="flex items-center text-yellow-500 font-bold">
              <DollarSign className="h-4 w-4" />
              <span>{battle.totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {battle.players.map((player, index) => {
              const isWinner = winningTeam === player.team && !isSpinning && currentCase >= battle.cases;
              const isLoser = winningTeam !== null && winningTeam !== player.team && !isSpinning && currentCase >= battle.cases;
              const playerTotal = getPlayerTotal(player.username);
              
              return (
                <Card 
                  key={index}
                  className={`bg-gray-800 border-none shadow overflow-hidden ${
                    isWinner ? 'ring-2 ring-green-500' : (isLoser ? 'opacity-70' : '')
                  }`}
                >
                  <div className="flex items-center justify-between p-3 border-b border-gray-700">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-700 mr-2">
                        <img 
                          src={player.avatar} 
                          alt={player.username}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-medium truncate max-w-[100px]">{player.username}</span>
                    </div>
                    <div className="flex items-center text-yellow-500 font-bold">
                      <DollarSign className="h-4 w-4" />
                      <span>{playerTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    {isWinner && (
                      <div className="bg-green-900 text-green-400 p-2 rounded mb-3 text-center font-bold flex items-center justify-center">
                        <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                        WINNER
                        <span className="ml-2 text-yellow-500">+{(battle.totalValue * 0.95).toFixed(2)}</span>
                      </div>
                    )}
                    
                    {isLoser && (
                      <div className="bg-red-900 text-red-400 p-2 rounded mb-3 text-center font-bold">
                        LOST BATTLE
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {playerResults[player.username]?.map((item, itemIndex) => (
                        <div key={itemIndex} className="bg-gray-700 p-2 rounded">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`h-3 w-3 rounded-full ${getRarityColorClass(item.rarity)} mr-2`}></div>
                              <span className="text-sm truncate max-w-[100px]">{item.name}</span>
                            </div>
                            <span className="text-yellow-500 font-bold text-sm">${item.value.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                      
                      {Array.from({ length: battle.cases - (playerResults[player.username]?.length || 0) }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="bg-gray-700 p-2 rounded h-8 animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white">Case Progress</h3>
              <div className="text-gray-400 text-sm">
                {currentCase}/{battle.cases}
              </div>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(currentCase / battle.cases) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-center">
            {!isSpinning && battle.status === 'waiting' && (
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                disabled={true}
              >
                Waiting for Players...
              </Button>
            )}
            
            {isSpinning && (
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={true}
              >
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Opening Cases...
              </Button>
            )}
            
            {!isSpinning && currentCase >= battle.cases && (
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={recreateBattle}
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Recreate Battle
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCaseBattleGame;
