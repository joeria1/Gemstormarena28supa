
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Users, Gem } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface Player {
  id: string;
  name: string;
  avatar: string;
  items: CaseItem[];
  totalValue: number;
  isSpinning?: boolean;
}

interface CaseItem {
  id: string;
  name: string;
  image: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface CaseBattleGameProps {
  battleId: string;
  onClose: () => void;
}

const rarityColors = {
  common: 'border-gray-400',
  uncommon: 'border-green-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const rarityGradients = {
  common: 'from-gray-500 to-gray-400',
  uncommon: 'from-green-600 to-green-500',
  rare: 'from-blue-700 to-blue-600',
  epic: 'from-purple-700 to-purple-600',
  legendary: 'from-amber-600 to-amber-500',
};

const mockItems: CaseItem[] = [
  { id: '1', name: 'Common Item', image: '/placeholder.svg', value: 25, rarity: 'common' },
  { id: '2', name: 'Uncommon Item', image: '/placeholder.svg', value: 75, rarity: 'uncommon' },
  { id: '3', name: 'Rare Item', image: '/placeholder.svg', value: 150, rarity: 'rare' },
  { id: '4', name: 'Epic Item', image: '/placeholder.svg', value: 350, rarity: 'epic' },
  { id: '5', name: 'Legendary Item', image: '/placeholder.svg', value: 1000, rarity: 'legendary' },
];

const CaseBattleGame: React.FC<CaseBattleGameProps> = ({ battleId, onClose }) => {
  const { user, updateBalance } = useUser();
  const [players, setPlayers] = useState<Player[]>([]);
  const [emptySlots, setEmptySlots] = useState<number>(4);
  const [battleStarted, setBattleStarted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds] = useState(3);
  const [caseOpened, setCaseOpened] = useState(false);
  
  useEffect(() => {
    // Mock data - in a real app, you would fetch this from your backend
    const mockPlayers: Player[] = [
      {
        id: '1',
        name: 'You',
        avatar: '/placeholder.svg',
        items: [],
        totalValue: 0,
        isSpinning: false
      }
    ];
    
    setPlayers(mockPlayers);
    setEmptySlots(4 - mockPlayers.length);
    
    // Calculate total potential value
    const caseValue = 100; // Example value
    setTotalValue(caseValue * 4);
  }, []);

  const handleJoinBattle = () => {
    if (players.length >= 4) return;
    
    const newPlayerNames = ['RocketMan', 'CryptoKing', 'MoonShooter'];
    const newPlayerName = newPlayerNames[Math.floor(Math.random() * newPlayerNames.length)];
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newPlayerName}`,
      items: [],
      totalValue: 0,
      isSpinning: false
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    setEmptySlots(prev => prev - 1);
    
    toast.success(`${newPlayerName} joined the battle!`);
    
    // If battle is full, start countdown
    if (players.length === 3) {
      toast.success('Battle is starting soon!');
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
    }
  };

  const startBattle = () => {
    setBattleStarted(true);
    setCurrentRound(1);
    startRound();
  };

  const startRound = () => {
    setSpinning(true);
    setCaseOpened(false);
    
    const updatedPlayers = players.map(player => ({
      ...player,
      isSpinning: true
    }));
    
    setPlayers(updatedPlayers);
    
    // Open the cases with a slight delay between players
    updatedPlayers.forEach((player, index) => {
      setTimeout(() => {
        openCase(player.id);
      }, index * 500); // Stagger case openings
    });
    
    // After all cases are opened, update round or end battle
    const totalDelay = players.length * 500 + 2000;
    setTimeout(() => {
      setSpinning(false);
      setCaseOpened(true);
      
      if (currentRound >= maxRounds) {
        endBattle();
      } else {
        // Prepare for next round
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          startRound();
        }, 2000);
      }
    }, totalDelay);
  };

  const openCase = (playerId: string) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        // Random item for this round
        const randomIndex = Math.floor(Math.random() * mockItems.length);
        const newItem = { ...mockItems[randomIndex], id: `${player.id}-item-${currentRound}` };
        
        // Update player's items and total value
        const updatedItems = [...player.items, newItem];
        const newTotalValue = updatedItems.reduce((sum, item) => sum + item.value, 0);
        
        return {
          ...player,
          items: updatedItems,
          totalValue: newTotalValue,
          isSpinning: false
        };
      }
      return player;
    }));
  };

  const endBattle = () => {
    // Determine winner based on total value
    const sortedPlayers = [...players].sort((a, b) => b.totalValue - a.totalValue);
    const battleWinner = sortedPlayers[0];
    setWinner(battleWinner);
    
    if (battleWinner.id === '1') {
      // Player won
      const winAmount = totalValue;
      updateBalance(winAmount);
      toast.success("You won the case battle!", {
        description: `You've been awarded ${winAmount} gems!`
      });
    } else {
      toast.error("You lost the case battle!", {
        description: `${battleWinner.name} won with ${battleWinner.totalValue} gems value!`
      });
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen w-full p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onClose}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Lobby
          </button>
          
          <div className="flex items-center text-gray-300">
            <span className="mr-2">Battle ID: {battleId}</span>
            <span className="px-3 py-1 bg-gray-800 rounded-md text-sm">2v2</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-300 mr-2">Total Value:</span>
            <span className="text-yellow-400 font-bold">{totalValue} gems</span>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          {battleStarted && (
            <div className="mb-4 text-center">
              <div className="text-xl font-bold text-white">
                Round {currentRound} of {maxRounds}
              </div>
              {spinning && (
                <div className="text-blue-400 animate-pulse mt-2">
                  Opening cases...
                </div>
              )}
            </div>
          )}
          
          {!battleStarted && countdown > 0 && (
            <div className="flex justify-center items-center mb-4">
              <div className="text-4xl font-bold text-yellow-400 animate-pulse">
                Starting in {countdown}...
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {players.map((player, index) => (
              <div key={player.id} className="relative">
                <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <img 
                        src={player.avatar} 
                        alt={player.name} 
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="text-white font-bold">{player.name}</div>
                    </div>
                    <div className="flex items-center">
                      <Gem className="h-4 w-4 text-yellow-400 mr-1" />
                      <div className="text-yellow-400">{player.totalValue}</div>
                    </div>
                  </div>
                  
                  <div className="h-40 p-2">
                    {player.isSpinning ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-blue-400 animate-pulse">Opening case...</div>
                      </div>
                    ) : battleStarted ? (
                      <div className="grid grid-cols-3 gap-1 h-full">
                        {player.items.map((item, itemIndex) => (
                          <motion.div 
                            key={item.id} 
                            className={`border-2 ${rarityColors[item.rarity]} rounded p-1 flex flex-col items-center justify-center bg-gradient-to-b ${rarityGradients[item.rarity]}`}
                            initial={caseOpened ? { scale: 0 } : { scale: 1 }}
                            animate={caseOpened ? { scale: 1 } : { scale: 1 }}
                            transition={{ delay: itemIndex * 0.2 }}
                          >
                            <img src={item.image} alt={item.name} className="w-full h-8 object-contain mb-1" />
                            <p className="text-xs text-white truncate w-full text-center">{item.name}</p>
                            <p className="text-xs text-yellow-400">{item.value}</p>
                          </motion.div>
                        ))}
                        
                        {/* Empty slots for future rounds */}
                        {Array(maxRounds - player.items.length).fill(0).map((_, emptyIndex) => (
                          <div 
                            key={`empty-${player.id}-${emptyIndex}`} 
                            className="border-2 border-gray-700 rounded p-1 flex items-center justify-center h-full"
                          >
                            <span className="text-gray-600 text-xs">Round {currentRound + emptyIndex + 1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-gray-400">Waiting for battle to start...</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* VS indicator between players */}
                {(index === 0 || index === 2) && (
                  <div className="absolute -right-7 top-1/2 transform -translate-y-1/2 z-10 bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                    VS
                  </div>
                )}
              </div>
            ))}
            
            {/* Empty slots */}
            {Array(emptySlots).fill(0).map((_, index) => (
              <div key={`empty-${index}`} className="relative">
                <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-3 border-b border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-gray-800"></div>
                    <div className="text-white">0</div>
                  </div>
                  
                  <div className="h-40 flex items-center justify-center">
                    <button 
                      onClick={handleJoinBattle} 
                      disabled={battleStarted}
                      className={`${battleStarted ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white py-2 px-4 rounded-md flex items-center`}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {battleStarted ? 'Battle in Progress' : 'Join Battle'}
                    </button>
                  </div>
                  
                  <div className="p-3 border-t border-gray-700 text-center">
                    <div className="text-gray-400">Empty Slot</div>
                  </div>
                </div>
                
                {/* VS indicator for empty slots */}
                {(players.length + index === 1 || players.length + index === 3) && (
                  <div className="absolute -right-7 top-1/2 transform -translate-y-1/2 z-10 bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                    VS
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {winner && (
          <div className="mt-6 bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6 text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              {winner.id === '1' ? 'You Won!' : `${winner.name} Won!`}
            </h3>
            <div className="flex justify-center items-center mb-4">
              <img 
                src={winner.avatar} 
                alt={winner.name} 
                className="w-16 h-16 rounded-full border-4 border-yellow-400"
              />
            </div>
            <p className="text-yellow-400 font-bold text-xl mb-2">Total Value: {winner.totalValue} gems</p>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-w-md mx-auto mt-4 mb-6">
              {winner.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`border-2 ${rarityColors[item.rarity]} rounded p-2 flex flex-col items-center justify-center bg-gradient-to-b ${rarityGradients[item.rarity]}`}
                >
                  <img src={item.image} alt={item.name} className="w-full h-10 object-contain mb-1" />
                  <p className="text-xs text-white truncate w-full text-center">{item.name}</p>
                  <p className="text-xs text-yellow-400">{item.value}</p>
                </div>
              ))}
            </div>
            
            <button 
              onClick={onClose}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Back to Lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseBattleGame;
