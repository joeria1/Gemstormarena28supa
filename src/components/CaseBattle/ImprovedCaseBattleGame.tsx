
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, ChevronLeft, Sword, DollarSign, Trophy, RefreshCw, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import CaseSlider from '../CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';

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
  status: 'waiting' | 'starting' | 'in-progress' | 'completed';
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

const MAX_PLAYERS = 4;

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

const caseItems: SliderItem[] = [
  { id: '1', name: 'Common Knife', image: '/placeholder.svg', rarity: 'common', price: 50 },
  { id: '2', name: 'Forest Shield', image: '/placeholder.svg', rarity: 'uncommon', price: 150 },
  { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare', price: 500 },
  { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic', price: 1000 },
  { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary', price: 2500 },
  { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical', price: 5000 },
];

const ImprovedCaseBattleGame: React.FC<ImprovedCaseBattleGameProps> = ({ battle, onClose, currentUser }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentCase, setCurrentCase] = useState(0);
  const [playerResults, setPlayerResults] = useState<Record<string, CaseItem[]>>({});
  const [teamTotals, setTeamTotals] = useState<Record<number, number>>({});
  const [winningTeam, setWinningTeam] = useState<number | null>(null);
  const [spinQueue, setSpinQueue] = useState<string[]>([]);
  const [activeSpinner, setActiveSpinner] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const { user, updateUser } = useContext(UserContext);
  
  const [allPlayers, setAllPlayers] = useState<Player[]>(battle.players);
  const maxPlayersForMode = getMaxPlayersForMode(battle.mode);
  const emptySlots = maxPlayersForMode - allPlayers.length;
  
  function getMaxPlayersForMode(mode: string): number {
    switch(mode) {
      case '1v1': return 2;
      case '2v2': return 4;
      case '1v1v1': return 3;
      case '1v1v1v1': return 4;
      default: return 2;
    }
  }
  
  useEffect(() => {
    const initialResults: Record<string, CaseItem[]> = {};
    allPlayers.forEach(player => {
      initialResults[player.username] = [];
    });
    setPlayerResults(initialResults);
    
    if (battle.status === 'in-progress') {
      startBattle();
    } else if (battle.status === 'starting') {
      startCountdown();
    }
  }, [battle, allPlayers]);
  
  const startCountdown = () => {
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          startBattle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const addBot = () => {
    if (allPlayers.length >= maxPlayersForMode) return;
    
    const botNames = ['BotMaster', 'CryptoBot', 'LuckyBot', 'BotLegend'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    const randomTeam = allPlayers.length % 2 + 1;
    
    const newBot: Player = {
      username: botName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${botName}`,
      team: battle.mode === '2v2' ? (allPlayers.length < 2 ? 1 : 2) : randomTeam
    };
    
    setAllPlayers(prev => [...prev, newBot]);
    
    // If adding this bot fills the battle, start the countdown
    if (allPlayers.length + 1 >= maxPlayersForMode) {
      toast.success("All players joined! Battle starting soon...");
      startCountdown();
    } else {
      toast.success(`Bot ${botName} added to the battle!`);
    }
  };
  
  const startBattle = () => {
    setIsSpinning(true);
    const updatedResults = { ...playerResults };
    allPlayers.forEach(player => {
      updatedResults[player.username] = [];
    });
    setPlayerResults(updatedResults);
    
    // Create a queue of players to spin
    const playerQueue = allPlayers.map(player => player.username);
    setSpinQueue(playerQueue);
    
    // Start spinning for first player
    processNextPlayerSpin();
  };
  
  const processNextPlayerSpin = () => {
    if (spinQueue.length === 0) {
      // All players have spun for this case
      if (currentCase >= battle.cases - 1) {
        // Battle is complete
        finishBattle();
      } else {
        // Move to next case
        setCurrentCase(prev => prev + 1);
        // Create a new queue for the next case
        const newQueue = allPlayers.map(player => player.username);
        setSpinQueue(newQueue);
        // Process the next case after a short delay
        setTimeout(() => {
          processNextPlayerSpin();
        }, 1000);
      }
      return;
    }
    
    // Get the next player in the queue
    const nextPlayer = spinQueue[0];
    // Remove this player from the queue
    setSpinQueue(prev => prev.slice(1));
    // Set as active spinner
    setActiveSpinner(nextPlayer);
    
    // Simulate spinning by showing for a few seconds before revealing the result
    setTimeout(() => {
      const caseItem = generateRandomCaseItems(1)[0];
      setPlayerResults(prev => ({
        ...prev,
        [nextPlayer]: [...(prev[nextPlayer] || []), caseItem]
      }));
      
      // After a short delay, move to the next player
      setTimeout(() => {
        setActiveSpinner(null);
        processNextPlayerSpin();
      }, 500);
    }, 3000);
  };
  
  const finishBattle = () => {
    setIsSpinning(false);
    
    const totals: Record<number, number> = {};
    allPlayers.forEach(player => {
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
    
    // Check if the current user is on the winning team
    const currentUserPlayer = allPlayers.find(p => p.username === currentUser);
    if (currentUserPlayer && currentUserPlayer.team === winner) {
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
    allPlayers.forEach(player => {
      initialResults[player.username] = [];
    });
    setPlayerResults(initialResults);
    setTeamTotals({});
    setWinningTeam(null);
    setCurrentCase(0);
    
    startBattle();
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
        
        {countdown > 0 && (
          <div className="p-6 text-center">
            <div className="text-4xl font-bold text-yellow-500 animate-pulse">
              Battle starting in {countdown}...
            </div>
          </div>
        )}
        
        {activeSpinner && (
          <div className="p-4 mb-4">
            <div className="text-center mb-2">
              <div className="text-xl font-bold text-blue-400">
                {activeSpinner}'s turn
              </div>
            </div>
            <CaseSlider 
              items={caseItems} 
              onComplete={() => {}} 
              autoSpin={true}
              spinDuration={3000}
              isSpinning={true}
              playerName={activeSpinner}
              highlightPlayer={activeSpinner === currentUser}
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {allPlayers.map((player, index) => {
              const isWinner = winningTeam === player.team && !isSpinning && currentCase >= battle.cases;
              const isLoser = winningTeam !== null && winningTeam !== player.team && !isSpinning && currentCase >= battle.cases;
              const playerTotal = getPlayerTotal(player.username);
              const isBot = !player.username.includes(currentUser) && player.username.includes('Bot');
              
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
                      <div className="flex items-center">
                        <span className="font-medium truncate max-w-[100px]">{player.username}</span>
                        {isBot && <Bot className="h-3 w-3 ml-1 text-blue-400" />}
                      </div>
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
            
            {/* Empty slots for adding bots */}
            {emptySlots > 0 && Array.from({ length: emptySlots }).map((_, index) => (
              <Card 
                key={`empty-${index}`}
                className="bg-gray-800 border-none shadow overflow-hidden"
              >
                <div className="flex items-center justify-between p-3 border-b border-gray-700">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-700 mr-2 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-500">Empty Slot</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <DollarSign className="h-4 w-4" />
                    <span>0.00</span>
                  </div>
                </div>
                
                <div className="p-3 flex items-center justify-center" style={{ minHeight: '160px' }}>
                  {!isSpinning && battle.status !== 'completed' && countdown === 0 && (
                    <Button 
                      onClick={addBot}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Add Bot
                    </Button>
                  )}
                  {(isSpinning || battle.status === 'completed' || countdown > 0) && (
                    <div className="text-gray-500">Empty slot</div>
                  )}
                </div>
              </Card>
            ))}
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
            {!isSpinning && battle.status === 'waiting' && emptySlots > 0 && countdown === 0 && (
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // Fill all remaining slots with bots
                  for (let i = 0; i < emptySlots; i++) {
                    addBot();
                  }
                }}
              >
                Fill with Bots & Start
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
            
            {!isSpinning && battle.status === 'waiting' && emptySlots === 0 && countdown === 0 && (
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={startCountdown}
              >
                Start Battle
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCaseBattleGame;
