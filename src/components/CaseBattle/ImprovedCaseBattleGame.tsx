
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { SliderItem } from '../../types/slider';
import CaseSlider from '../CaseSlider/CaseSlider';
import { X, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CaseBattlePlayer {
  username: string;
  avatar: string;
  team: number;
}

interface CaseBattleProps {
  battle: {
    id: string;
    creator: {
      id: string;
      name: string;
      username: string;
      avatar: string;
    };
    mode: '1v1' | '2v2' | '1v1v1' | '1v1v1v1';
    totalValue: number;
    cases: number;
    players: CaseBattlePlayer[];
    status: 'waiting' | 'starting' | 'in-progress' | 'completed';
    createdAt: Date;
    winnerId?: string;
  };
  onClose: () => void;
  currentUser: string;
}

const ImprovedCaseBattleGame: React.FC<CaseBattleProps> = ({ battle, onClose, currentUser }) => {
  const { toast } = useToast();
  const [showWinner, setShowWinner] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [roundResults, setRoundResults] = useState<Record<string, SliderItem[]>>({});
  const [winner, setWinner] = useState<CaseBattlePlayer | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [roundStarting, setRoundStarting] = useState(false);
  
  // Sample items for the slider
  const sliderItems: SliderItem[] = [
    { id: '1', name: 'Common Knife', image: '/placeholder.svg', rarity: 'common', price: 50 },
    { id: '2', name: 'Forest Shield', image: '/placeholder.svg', rarity: 'uncommon', price: 150 },
    { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare', price: 500 },
    { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic', price: 1000 },
    { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary', price: 2500 },
    { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical', price: 5000 },
  ];
  
  useEffect(() => {
    // Auto-start the battle if it's in progress
    if (battle.status === 'in-progress' && !spinning && currentRound < battle.cases) {
      const timer = setTimeout(() => {
        setRoundStarting(true);
        
        setTimeout(() => {
          setRoundStarting(false);
          startRound();
        }, 2000);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [battle.status, spinning, currentRound, battle.cases]);
  
  // Start a round of case opening
  const startRound = () => {
    if (spinning || currentRound >= battle.cases) return;
    
    setSpinning(true);
    
    // Initialize round results if needed
    if (!roundResults[currentRound]) {
      const initialResults: Record<string, SliderItem[]> = { ...roundResults };
      initialResults[currentRound] = [];
      setRoundResults(initialResults);
    }
  };
  
  // Handle completion of a player's spin
  const handleSpinComplete = (player: CaseBattlePlayer, item: SliderItem) => {
    const updatedResults = { ...roundResults };
    
    if (!updatedResults[currentRound]) {
      updatedResults[currentRound] = [];
    }
    
    // Store the result for this player
    updatedResults[currentRound] = [
      ...updatedResults[currentRound],
      { ...item, playerId: player.username }
    ];
    
    setRoundResults(updatedResults);
    
    // Check if all players have completed their spins
    if (updatedResults[currentRound].length === battle.players.length) {
      // Calculate round value
      const roundValue = updatedResults[currentRound].reduce((sum, item) => sum + item.price, 0);
      setTotalValue(prev => prev + roundValue);
      
      // Move to next round after a delay
      setTimeout(() => {
        setSpinning(false);
        
        // Move to next round or end battle
        if (currentRound + 1 < battle.cases) {
          setCurrentRound(currentRound + 1);
        } else {
          // Battle complete, determine winner
          const playerTotals: Record<string, number> = {};
          
          // Calculate totals for each player
          Object.values(updatedResults).forEach(roundItems => {
            roundItems.forEach(item => {
              const playerId = item.playerId as string;
              playerTotals[playerId] = (playerTotals[playerId] || 0) + item.price;
            });
          });
          
          // Find the player with the highest total
          let highestValue = 0;
          let winningPlayer = '';
          
          Object.entries(playerTotals).forEach(([playerId, total]) => {
            if (total > highestValue) {
              highestValue = total;
              winningPlayer = playerId;
            }
          });
          
          const winnerData = battle.players.find(p => p.username === winningPlayer) || null;
          setWinner(winnerData);
          
          // Show winner after a delay
          setTimeout(() => {
            setShowWinner(true);
          }, 1000);
        }
      }, 2000);
    }
  };
  
  // Get a random item for a player (with slightly improved odds for the current user)
  const getRandomItemForPlayer = (player: CaseBattlePlayer) => {
    const isCurrentUser = player.username === currentUser;
    
    // Slightly better odds for the current user
    if (isCurrentUser && Math.random() < 0.6) {
      // Better items for current user
      const betterItems = sliderItems.filter(item => 
        item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'mythical'
      );
      return betterItems[Math.floor(Math.random() * betterItems.length)];
    }
    
    // Random item for other players or if current user didn't get lucky
    return sliderItems[Math.floor(Math.random() * sliderItems.length)];
  };
  
  return (
    <div className="bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-800 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            Case Battle
            <Badge className="ml-2 bg-blue-600">{battle.mode}</Badge>
          </h2>
          <p className="text-gray-400">Total Value: ${battle.totalValue.toFixed(2)}</p>
        </div>
        
        <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      
      {/* Battle status */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-blue-400" />
          <span className="text-sm text-gray-300">Created {new Date(battle.createdAt).toLocaleTimeString()}</span>
        </div>
        
        <Badge className={
          battle.status === 'waiting' ? 'bg-yellow-600' :
          battle.status === 'starting' ? 'bg-blue-600' :
          battle.status === 'in-progress' ? 'bg-green-600' : 'bg-purple-600'
        }>
          {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
        </Badge>
      </div>
      
      {/* Players */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {battle.players.map((player, index) => (
          <Card key={index} className={`p-3 bg-gray-800 border ${
            player.username === currentUser ? 'border-green-500' : 'border-gray-700'
          }`}>
            <div className="flex flex-col items-center">
              <Avatar className="h-14 w-14 mb-2">
                <AvatarImage src={player.avatar} />
                <AvatarFallback>{player.username[0]}</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium truncate max-w-full">{player.username}</div>
              {battle.mode.includes('2v2') && (
                <Badge className="mt-1 bg-gray-700">Team {player.team}</Badge>
              )}
            </div>
          </Card>
        ))}
        
        {/* Show empty slots */}
        {Array.from({ length: 
          battle.mode === '1v1' ? 2 - battle.players.length : 
          battle.mode === '2v2' ? 4 - battle.players.length : 
          battle.mode === '1v1v1' ? 3 - battle.players.length : 
          4 - battle.players.length 
        }).map((_, index) => (
          <Card key={`empty-${index}`} className="p-3 bg-gray-800 border border-gray-700 opacity-50">
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 mb-2 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xl">?</span>
              </div>
              <div className="text-sm font-medium text-gray-500">Waiting...</div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Rounds progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Rounds</h3>
          <span className="text-gray-400 text-sm">{currentRound + 1} / {battle.cases}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: battle.cases }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded ${
                index < currentRound
                  ? 'bg-green-500'
                  : index === currentRound
                  ? 'bg-blue-500'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Case opening area */}
      {spinning ? (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 gap-6">
            {battle.players.map((player, playerIndex) => (
              <div key={playerIndex} className="relative">
                <div className="flex items-center mb-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={player.avatar} />
                    <AvatarFallback>{player.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{player.username}</span>
                </div>
                
                {roundResults[currentRound] && 
                roundResults[currentRound].find(item => item.playerId === player.username) ? (
                  <div className="bg-gray-700 h-24 rounded-lg flex items-center justify-center p-3">
                    {roundResults[currentRound]
                      .filter(item => item.playerId === player.username)
                      .map((item, itemIndex) => (
                        <div key={itemIndex} className="flex flex-col items-center">
                          <img src={item.image} alt={item.name} className="w-12 h-12 mb-1" />
                          <div className="text-xs font-medium mb-1">{item.name}</div>
                          <div className="text-xs text-yellow-400">${item.price}</div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <CaseSlider
                    items={sliderItems}
                    onComplete={(item) => handleSpinComplete(player, item)}
                    caseName="Standard Case"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : roundStarting ? (
        <div className="bg-gray-800 p-12 rounded-lg mb-6 text-center">
          <h3 className="text-xl font-bold mb-2">Round {currentRound + 1} Starting...</h3>
          <p className="text-gray-400">Get ready for the next round!</p>
        </div>
      ) : battle.status === 'waiting' ? (
        <div className="bg-gray-800 p-12 rounded-lg mb-6 text-center">
          <h3 className="text-xl font-bold mb-2">Waiting for Players</h3>
          <p className="text-gray-400">{battle.players.length} / {
            battle.mode === '1v1' ? 2 : 
            battle.mode === '2v2' ? 4 : 
            battle.mode === '1v1v1' ? 3 : 4
          } players joined</p>
        </div>
      ) : battle.status === 'starting' ? (
        <div className="bg-gray-800 p-12 rounded-lg mb-6 text-center">
          <h3 className="text-xl font-bold mb-2">Battle Starting...</h3>
          <p className="text-gray-400">All players have joined. The battle will begin shortly!</p>
        </div>
      ) : showWinner ? (
        <motion.div 
          className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 rounded-lg mb-6 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <Trophy className="text-yellow-400 h-16 w-16 mb-2" />
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  opacity: [0.7, 0.2, 0.7], 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="text-yellow-300 h-16 w-16 mb-2 blur-sm" />
              </motion.div>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">
              {winner?.username === currentUser ? 'You Won!' : `${winner?.username} Won!`}
            </h3>
            
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={winner?.avatar} />
              <AvatarFallback>{winner?.username[0]}</AvatarFallback>
            </Avatar>
            
            <div className="text-lg mb-2">Total Value</div>
            <div className="text-3xl font-bold text-yellow-400 mb-6">${totalValue.toFixed(2)}</div>
            
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Exit Battle
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-gray-800 p-12 rounded-lg mb-6 text-center">
          <h3 className="text-xl font-bold mb-2">Round Complete</h3>
          <p className="text-gray-400">
            {currentRound < battle.cases 
              ? 'Next round starting soon...' 
              : 'All rounds completed. Calculating winner...'}
          </p>
        </div>
      )}
      
      {/* Previous rounds results */}
      {Object.keys(roundResults).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(roundResults)
              .filter(([round]) => parseInt(round) < currentRound)
              .map(([round, items]) => (
                <Card key={round} className="bg-gray-800 border-gray-700 p-3">
                  <h4 className="text-sm font-medium mb-2">Round {parseInt(round) + 1}</h4>
                  <div className="space-y-2">
                    {battle.players.map((player, playerIndex) => {
                      const playerItem = items.find(item => item.playerId === player.username);
                      
                      return (
                        <div key={playerIndex} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={player.avatar} />
                              <AvatarFallback>{player.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{player.username}</span>
                          </div>
                          
                          {playerItem ? (
                            <div className="flex items-center">
                              <img src={playerItem.image} alt={playerItem.name} className="w-6 h-6 mr-1" />
                              <span className="text-xs text-yellow-400">${playerItem.price}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No result</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedCaseBattleGame;
