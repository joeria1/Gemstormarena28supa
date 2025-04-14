
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Bot, Gem, Users } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';
import SpinningEffect from '../GameEffects/SpinningEffect';

interface Player {
  id: string;
  name: string;
  avatar: string;
  items: CaseItem[];
  totalValue: number;
  isSpinning?: boolean;
  isBot?: boolean;
  lastWonItem?: SliderItem;
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
  cursedMode?: boolean;
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

const caseItems: SliderItem[] = [
  { id: '1', name: 'Common Knife', image: '/placeholder.svg', rarity: 'common', price: 50 },
  { id: '2', name: 'Forest Shield', image: '/placeholder.svg', rarity: 'uncommon', price: 150 },
  { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare', price: 500 },
  { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic', price: 1000 },
  { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary', price: 2500 },
  { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical', price: 5000 },
];

const SimplifiedCaseBattleGame: React.FC = () => {
  const { user, updateBalance } = useUser();
  const [players, setPlayers] = useState<Player[]>([]);
  const [emptySlots, setEmptySlots] = useState<number>(2);
  const [battleStarted, setBattleStarted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds] = useState(3);
  const [caseOpened, setCaseOpened] = useState(false);
  const [showCaseOpening, setShowCaseOpening] = useState(false);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [isPersonalCaseSpinning, setIsPersonalCaseSpinning] = useState(false);
  const [cursedMode, setCursedMode] = useState(false);
  const battleId = "BT" + Math.floor(Math.random() * 10000);
  
  useEffect(() => {
    if (user) {
      const mockPlayers: Player[] = [
        {
          id: '1',
          name: user.username,
          avatar: user.avatar || '/placeholder.svg',
          items: [],
          totalValue: 0,
          isSpinning: false
        }
      ];
      
      setPlayers(mockPlayers);
      setEmptySlots(2 - mockPlayers.length);
    }
    
    const caseValue = 100;
    setTotalValue(caseValue * 2);
  }, [user]);

  const handleAddBot = () => {
    if (players.length >= 2) return;
    
    const botNames = ['BotMaster', 'AIPlayer', 'RoboGamer'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    
    const newBot: Player = {
      id: Date.now().toString(),
      name: botName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${botName}`,
      items: [],
      totalValue: 0,
      isSpinning: false,
      isBot: true
    };
    
    setPlayers(prev => [...prev, newBot]);
    setEmptySlots(prev => prev - 1);
    
    toast.success(`Bot ${botName} added to the battle!`);
    
    if (players.length === 1) {
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
    
    startPlayerCases();
  };

  const startPlayerCases = () => {
    if (players.length === 0) return;
    
    const runPlayerSequence = (index: number) => {
      if (index >= players.length) {
        finishRound();
        return;
      }
      
      const currentPlayer = players[index];
      setActivePlayer(currentPlayer.id);
      
      setPlayers(prev => prev.map(player => 
        player.id === currentPlayer.id 
          ? { ...player, isSpinning: true } 
          : player
      ));
      
      setTimeout(() => {
        openCase(currentPlayer.id);
        
        setTimeout(() => {
          runPlayerSequence(index + 1);
        }, 1000);
      }, 5000);
    };
    
    runPlayerSequence(0);
  };

  const openCase = (playerId: string) => {
    const randomIndex = Math.floor(Math.random() * mockItems.length);
    const newItem = { ...mockItems[randomIndex], id: `${playerId}-item-${currentRound}` };
    
    const sliderItem: SliderItem = {
      id: newItem.id,
      name: newItem.name,
      image: newItem.image,
      rarity: newItem.rarity,
      price: newItem.value,
      playerId: playerId
    };
    
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const updatedItems = [...player.items, newItem];
        const newTotalValue = updatedItems.reduce((sum, item) => sum + item.value, 0);
        
        return {
          ...player,
          items: updatedItems,
          totalValue: newTotalValue,
          isSpinning: false,
          lastWonItem: sliderItem
        };
      }
      return player;
    }));
    
    const player = players.find(p => p.id === playerId);
    if (player) {
      if (newItem.rarity === 'legendary') {
        toast.success(`${player.name} got an INCREDIBLE item!`, {
          description: `${newItem.name} worth ${newItem.value} gems!`
        });
      } else if (newItem.rarity === 'epic') {
        toast.success(`${player.name} got a great item!`, {
          description: `${newItem.name} worth ${newItem.value} gems!`
        });
      } else {
        toast(`${player.name} got: ${newItem.name}`, {
          description: `Worth ${newItem.value} gems!`
        });
      }
    }
  };

  const finishRound = () => {
    setActivePlayer(null);
    setSpinning(false);
    setCaseOpened(true);
    
    if (currentRound >= maxRounds) {
      endBattle();
    } else {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        startRound();
      }, 2000);
    }
  };

  const endBattle = () => {
    let sortedPlayers = [...players];
    
    if (cursedMode) {
      sortedPlayers = sortedPlayers.sort((a, b) => a.totalValue - b.totalValue);
      toast.info("CURSED MODE: Lowest value wins!");
    } else {
      sortedPlayers = sortedPlayers.sort((a, b) => b.totalValue - a.totalValue);
    }
    
    const battleWinner = sortedPlayers[0];
    setWinner(battleWinner);
    
    if (battleWinner.id === '1') {
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

  const handleOpenPersonalCase = () => {
    if (isPersonalCaseSpinning) return;
    
    if (!user) {
      toast.error('Please log in to open cases');
      return;
    }
    
    const casePrice = 100;
    
    if (user.balance < casePrice) {
      toast.error('Insufficient balance to open this case');
      return;
    }
    
    updateBalance(-casePrice);
    setIsPersonalCaseSpinning(true);
    setShowCaseOpening(true);
  };

  const handlePersonalSpinComplete = (item: SliderItem) => {
    if (!user) return;
    
    updateBalance(item.price);
    
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
    
    setTimeout(() => {
      setIsPersonalCaseSpinning(false);
    }, 1000);
  };

  const onClose = () => {
    // Reset the state
    setPlayers([]);
    setBattleStarted(false);
    setWinner(null);
    setCurrentRound(0);
    setCaseOpened(false);
    setSpinning(false);
    
    if (user) {
      const mockPlayers: Player[] = [
        {
          id: '1',
          name: user.username,
          avatar: user.avatar || '/placeholder.svg',
          items: [],
          totalValue: 0,
          isSpinning: false
        }
      ];
      
      setPlayers(mockPlayers);
      setEmptySlots(2 - mockPlayers.length);
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
            Reset Battle
          </button>
          
          <div className="flex items-center text-gray-300">
            <span className="mr-2">Battle ID: {battleId}</span>
            <span className="px-3 py-1 bg-gray-800 rounded-md text-sm">1v1</span>
            {cursedMode && (
              <span className="ml-2 px-3 py-1 bg-red-900 text-red-200 rounded-md text-sm">
                CURSED MODE
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="text-gray-300 mr-2">Total Value:</span>
              <span className="text-yellow-400 font-bold">{totalValue} gems</span>
            </div>
            
            {user && (
              <div className="flex items-center bg-gray-800 px-3 py-1 rounded-md">
                <Gem className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-white font-medium">{user.balance}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold text-white mb-4">Open Case</h2>
            
            {showCaseOpening ? (
              <>
                <CaseSlider 
                  items={caseItems} 
                  onComplete={handlePersonalSpinComplete}
                  spinDuration={5000}
                  isSpinning={isPersonalCaseSpinning}
                  setIsSpinning={setIsPersonalCaseSpinning}
                  caseName="Standard Case"
                />
                
                <div className="mt-4 flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setShowCaseOpening(false)}
                  >
                    Back to Battle
                  </Button>
                  
                  <Button 
                    onClick={handleOpenPersonalCase}
                    disabled={isPersonalCaseSpinning || (user && user.balance < 100)}
                  >
                    {isPersonalCaseSpinning ? "Opening..." : "Open Case (100 gems)"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-60">
                <div className="text-gray-400 mb-4">Click the button below to open a case</div>
                <Button 
                  onClick={handleOpenPersonalCase}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={user && user.balance < 100}
                >
                  Open Standard Case (100 gems)
                </Button>
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="mb-4 text-center">
              <div className="text-xl font-bold text-white">
                {battleStarted ? `Round ${currentRound} of ${maxRounds}` : '1v1 Battle'}
              </div>
              {spinning && (
                <div className="text-blue-400 animate-pulse mt-2">
                  {activePlayer ? 
                    `${players.find(p => p.id === activePlayer)?.name || 'Player'} is opening a case...` : 
                    'Opening cases...'}
                </div>
              )}
              {!battleStarted && countdown > 0 && (
                <div className="text-4xl font-bold text-yellow-400 animate-pulse mt-2">
                  Starting in {countdown}...
                </div>
              )}
            </div>
            
            {activePlayer && spinning && (
              <div className="mb-6">
                <div className="text-center mb-2 text-blue-300 font-bold">
                  {players.find(p => p.id === activePlayer)?.name}'s Case
                </div>
                <CaseSlider 
                  items={caseItems.map(item => ({...item, playerId: activePlayer}))}
                  onComplete={(item) => {/* Animation only, actual logic handled in openCase */}}
                  spinDuration={5000}
                  isSpinning={true}
                  autoSpin={true}
                  playerName={players.find(p => p.id === activePlayer)?.name}
                  highlightPlayer={activePlayer === '1'}
                  caseName="Standard Case"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {players.map((player, index) => (
                <div key={player.id} className="relative">
                  <div className={`bg-gray-900 border ${player.id === activePlayer ? 'border-blue-500' : 'border-gray-700'} rounded-lg overflow-hidden`}>
                    <div className="flex items-center justify-between p-3 border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <img 
                          src={player.avatar} 
                          alt={player.name} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-white font-bold flex items-center">
                          {player.name}
                          {player.isBot && <Bot className="ml-1 h-3 w-3 text-blue-400" />}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Gem className="h-4 w-4 text-yellow-400 mr-1" />
                        <div className="text-yellow-400">{player.totalValue}</div>
                      </div>
                    </div>
                    
                    <div className="p-2 min-h-[160px]">
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
                          <div className="text-blue-300">Waiting to open cases...</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index === 0 && players.length > 1 && (
                    <div className="absolute -right-7 top-1/2 transform -translate-y-1/2 z-10 bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                      VS
                    </div>
                  )}
                </div>
              ))}
              
              {Array(emptySlots).fill(0).map((_, index) => (
                <div key={`empty-${index}`} className="relative">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 p-3 border-b border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="text-white">0</div>
                    </div>
                    
                    <div className="min-h-[160px] flex items-center justify-center">
                      <button 
                        onClick={handleAddBot} 
                        disabled={battleStarted}
                        className={`${battleStarted ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-md flex items-center`}
                      >
                        <Bot className="mr-2 h-4 w-4" />
                        {battleStarted ? 'Battle in Progress' : 'Add Bot'}
                      </button>
                    </div>
                  </div>
                  
                  {index === 0 && players.length === 1 && (
                    <div className="absolute -left-7 top-1/2 transform -translate-y-1/2 z-10 bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                      VS
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {emptySlots === 0 && !battleStarted && countdown === 0 && (
              <div className="text-center mt-4">
                <Button 
                  onClick={startBattle}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start Battle
                </Button>
              </div>
            )}
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
              Reset Battle
            </button>
          </div>
        )}
      </div>
      
      {winner && winner.id === '1' && (
        <SpinningEffect isSpinning={true}>
          <div className="h-full w-full absolute inset-0 pointer-events-none z-50"></div>
        </SpinningEffect>
      )}
    </div>
  );
};

export default SimplifiedCaseBattleGame;
