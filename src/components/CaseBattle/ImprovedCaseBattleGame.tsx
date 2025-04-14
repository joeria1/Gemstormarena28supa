
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { ArrowLeft, Gem, User, Trophy, Bot } from 'lucide-react';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';

interface CaseBattlePlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  items: SliderItem[];
  totalValue: number;
}

interface ImprovedCaseBattleGameProps {
  battleId: string;
  onClose: () => void;
}

const ImprovedCaseBattleGame: React.FC<ImprovedCaseBattleGameProps> = ({ battleId, onClose }) => {
  const { user, updateBalance } = useUser();
  const [players, setPlayers] = useState<CaseBattlePlayer[]>([]);
  const [currentCase, setCurrentCase] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<CaseBattlePlayer | null>(null);
  
  // Sample case items
  const caseItems: SliderItem[] = [
    { id: '1', name: 'Common Item', image: '/placeholder.svg', rarity: 'common', price: 50 },
    { id: '2', name: 'Uncommon Item', image: '/placeholder.svg', rarity: 'uncommon', price: 100 },
    { id: '3', name: 'Rare Item', image: '/placeholder.svg', rarity: 'rare', price: 250 },
    { id: '4', name: 'Epic Item', image: '/placeholder.svg', rarity: 'epic', price: 500 },
    { id: '5', name: 'Legendary Item', image: '/placeholder.svg', rarity: 'legendary', price: 1000 }
  ];
  
  useEffect(() => {
    // Initialize players
    if (user) {
      const initialPlayers: CaseBattlePlayer[] = [
        {
          id: user.id,
          name: user.username,
          avatar: user.avatar || '/placeholder.svg',
          isBot: false,
          items: [],
          totalValue: 0
        },
        {
          id: 'bot1',
          name: 'RobotPlayer',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RobotPlayer',
          isBot: true,
          items: [],
          totalValue: 0
        }
      ];
      
      setPlayers(initialPlayers);
    }
  }, [user]);
  
  const startGame = () => {
    if (!user) {
      toast.error('Please log in to play');
      return;
    }
    
    setGameState('playing');
    openCase();
  };
  
  const openCase = () => {
    setIsSpinning(true);
  };
  
  const handleSpinComplete = (item: SliderItem) => {
    // Add the item to the current player
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    
    // Add playerId to the item
    const itemWithPlayerId = { ...item, playerId: player.id };
    
    player.items.push(itemWithPlayerId);
    player.totalValue += item.price;
    
    setPlayers(updatedPlayers);
    
    // Show toast with result
    toast(`${player.name} won: ${item.name}`, {
      description: `Worth ${item.price} gems!`
    });
    
    // Move to next player or case
    setTimeout(() => {
      moveToNextTurn();
    }, 1000);
  };
  
  const moveToNextTurn = () => {
    let nextPlayer = currentPlayer + 1;
    let nextCase = currentCase;
    
    // If all players have opened this case, move to next case
    if (nextPlayer >= players.length) {
      nextPlayer = 0;
      nextCase += 1;
    }
    
    // If all cases have been opened, end game
    if (nextCase >= 3) {
      finishGame();
      return;
    }
    
    setCurrentPlayer(nextPlayer);
    setCurrentCase(nextCase);
    setIsSpinning(false);
    
    // Auto-open for bots
    if (players[nextPlayer].isBot) {
      setTimeout(() => {
        openCase();
      }, 1000);
    }
  };
  
  const finishGame = () => {
    // Determine winner
    const sortedPlayers = [...players].sort((a, b) => b.totalValue - a.totalValue);
    const battleWinner = sortedPlayers[0];
    
    setWinner(battleWinner);
    setGameState('finished');
    
    // If user won, award them
    if (battleWinner.id === user?.id) {
      const winAmount = 500; // Example amount
      updateBalance(winAmount);
      
      toast.success('You won the battle!', {
        description: `You've been awarded ${winAmount} gems!`
      });
    } else {
      toast.error('You lost the battle!', {
        description: `${battleWinner.name} won with items worth ${battleWinner.totalValue} gems.`
      });
    }
  };
  
  const resetGame = () => {
    setPlayers(prev => prev.map(player => ({...player, items: [], totalValue: 0})));
    setCurrentCase(0);
    setCurrentPlayer(0);
    setGameState('waiting');
    setIsSpinning(false);
    setWinner(null);
  };
  
  const getCurrentPlayerName = () => {
    return players[currentPlayer]?.name || 'Player';
  };
  
  const getCurrentCaseName = () => {
    const caseNames = ['Starter Case', 'Advanced Case', 'Premium Case'];
    return caseNames[currentCase] || 'Case';
  };
  
  return (
    <div className="bg-gray-900 p-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onClose}
            className="flex items-center text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Battles
          </button>
          
          <div className="text-gray-300">
            Battle ID: {battleId}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          {gameState === 'waiting' && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Battle?</h2>
              <p className="text-gray-400 mb-6">You will go head-to-head with another player to open 3 cases. The player with the highest total value wins!</p>
              <Button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 font-bold px-8"
              >
                Start Battle
              </Button>
            </div>
          )}
          
          {gameState === 'playing' && (
            <div>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Case {currentCase + 1} of 3: {getCurrentCaseName()}
                </h2>
                <p className="text-blue-400">
                  {isSpinning ? 
                    `${getCurrentPlayerName()} is opening the case...` : 
                    `${getCurrentPlayerName()}'s turn to open`}
                </p>
              </div>
              
              <div className="mb-6">
                <CaseSlider
                  items={caseItems}
                  onComplete={handleSpinComplete}
                  isSpinning={isSpinning}
                  setIsSpinning={setIsSpinning}
                  playerName={getCurrentPlayerName()}
                  highlightPlayer={currentPlayer === 0}
                  caseName={getCurrentCaseName()}
                />
              </div>
              
              {!isSpinning && currentPlayer === 0 && (
                <div className="text-center mb-4">
                  <Button
                    onClick={openCase}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Open Case
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {players.map((player, index) => (
                  <div 
                    key={player.id}
                    className={`bg-gray-900 border ${currentPlayer === index && gameState === 'playing' ? 'border-blue-500' : 'border-gray-700'} rounded-lg overflow-hidden`}
                  >
                    <div className="flex items-center justify-between p-3 border-b border-gray-700">
                      <div className="flex items-center">
                        <img 
                          src={player.avatar}
                          alt={player.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div className="font-medium text-white flex items-center">
                          {player.name}
                          {player.isBot && <Bot className="h-3 w-3 ml-1 text-blue-400" />}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Gem className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-yellow-400 font-medium">{player.totalValue}</span>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="grid grid-cols-3 gap-2">
                        {player.items.map((item, itemIndex) => (
                          <div 
                            key={itemIndex}
                            className={`bg-gray-800 border border-${item.rarity === 'legendary' ? 'yellow' : item.rarity === 'epic' ? 'purple' : item.rarity === 'rare' ? 'blue' : item.rarity === 'uncommon' ? 'green' : 'gray'}-500 rounded p-2`}
                          >
                            <img src={item.image} alt={item.name} className="w-full h-10 object-contain mb-1" />
                            <div className="text-white text-xs truncate">{item.name}</div>
                            <div className="text-yellow-400 text-xs flex items-center justify-center">
                              <Gem className="h-3 w-3 mr-1" />
                              {item.price}
                            </div>
                          </div>
                        ))}
                        
                        {/* Empty slots */}
                        {Array(3 - player.items.length).fill(0).map((_, i) => (
                          <div 
                            key={`empty-${i}`}
                            className="border border-dashed border-gray-700 rounded h-24 flex items-center justify-center"
                          >
                            <span className="text-gray-600 text-xs">Case {player.items.length + i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {gameState === 'finished' && winner && (
            <div className="text-center py-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                {winner.id === user?.id ? 'You Won!' : `${winner.name} Won!`}
              </h2>
              
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={winner.avatar}
                    alt={winner.name}
                    className="w-20 h-20 rounded-full border-4 border-yellow-500"
                  />
                  <Trophy className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400" />
                </div>
              </div>
              
              <p className="text-yellow-400 font-bold text-xl mb-6">
                Total Value: {winner.totalValue} gems
              </p>
              
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
                {winner.items.map((item, index) => (
                  <div 
                    key={index}
                    className={`bg-gray-800 border border-${item.rarity === 'legendary' ? 'yellow' : item.rarity === 'epic' ? 'purple' : item.rarity === 'rare' ? 'blue' : item.rarity === 'uncommon' ? 'green' : 'gray'}-500 rounded p-3`}
                  >
                    <img src={item.image} alt={item.name} className="w-full h-12 object-contain mb-2" />
                    <div className="text-white text-sm truncate">{item.name}</div>
                    <div className="text-yellow-400 text-sm flex items-center justify-center mt-1">
                      <Gem className="h-3 w-3 mr-1" />
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedCaseBattleGame;
