
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Users } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  avatar: string;
  items: CaseItem[];
  totalValue: number;
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

const mockItems: CaseItem[] = [
  { id: '1', name: 'Common Item', image: '/placeholder.svg', value: 25, rarity: 'common' },
  { id: '2', name: 'Uncommon Item', image: '/placeholder.svg', value: 75, rarity: 'uncommon' },
  { id: '3', name: 'Rare Item', image: '/placeholder.svg', value: 150, rarity: 'rare' },
  { id: '4', name: 'Epic Item', image: '/placeholder.svg', value: 350, rarity: 'epic' },
  { id: '5', name: 'Legendary Item', image: '/placeholder.svg', value: 1000, rarity: 'legendary' },
];

const CaseBattleGame: React.FC<CaseBattleGameProps> = ({ battleId, onClose }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [emptySlots, setEmptySlots] = useState<number>(4);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  
  useEffect(() => {
    // Mock data - in a real app, you would fetch this from your backend
    const mockPlayers: Player[] = [
      {
        id: '1',
        name: 'You',
        avatar: '/placeholder.svg',
        items: [],
        totalValue: 0
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
      totalValue: 0
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
            startSpin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const startSpin = () => {
    setSpinning(true);
    
    // Simulate spinning results for each player
    const updatedPlayers = [...players];
    
    // Simulate items for players
    updatedPlayers.forEach(player => {
      const playerItems: CaseItem[] = [];
      let total = 0;
      
      for (let i = 0; i < 3; i++) {
        // Random item selection
        const randomIndex = Math.floor(Math.random() * mockItems.length);
        const item = { ...mockItems[randomIndex], id: `${player.id}-item-${i}` };
        playerItems.push(item);
        total += item.value;
      }
      
      player.items = playerItems;
      player.totalValue = total;
    });
    
    setPlayers(updatedPlayers);
    
    // After 3 seconds, determine winner
    setTimeout(() => {
      const sortedPlayers = [...updatedPlayers].sort((a, b) => b.totalValue - a.totalValue);
      setWinner(sortedPlayers[0]);
      setSpinning(false);
      
      if (sortedPlayers[0].id === '1') {
        toast.success("You won the case battle!");
      } else {
        toast.error("You lost the case battle!");
      }
    }, 3000);
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
          <div className="flex justify-between items-center mb-8">
            <div className="text-white text-xl font-bold">
              Waiting For Players ({players.length}/4)
            </div>
            
            {countdown > 0 && (
              <div className="text-yellow-400 font-bold">
                Starting in {countdown}...
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {players.map((player, index) => (
              <div key={player.id} className="relative">
                <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 p-3 border-b border-gray-700">
                    <img 
                      src={player.avatar} 
                      alt={player.name} 
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="text-white">{spinning || player.items.length > 0 ? player.totalValue : 0}</div>
                  </div>
                  
                  <div className="h-40 p-2">
                    {spinning ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-gray-400 animate-pulse">Spinning...</div>
                      </div>
                    ) : player.items.length > 0 ? (
                      <div className="grid grid-cols-3 gap-1 h-full">
                        {player.items.map(item => (
                          <div 
                            key={item.id} 
                            className={`border-2 ${rarityColors[item.rarity]} rounded p-1 flex flex-col items-center justify-center`}
                          >
                            <img src={item.image} alt={item.name} className="w-full h-8 object-contain mb-1" />
                            <p className="text-xs text-white truncate w-full text-center">{item.name}</p>
                            <p className="text-xs text-yellow-400">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-gray-400">Waiting...</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-gray-700 text-center">
                    <div className="text-white">{player.name}</div>
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
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Join Battle
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
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {winner.id === '1' ? 'You Won!' : `${winner.name} Won!`}
            </h3>
            <p className="text-yellow-400 font-bold text-xl">Total Value: {winner.totalValue} gems</p>
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
