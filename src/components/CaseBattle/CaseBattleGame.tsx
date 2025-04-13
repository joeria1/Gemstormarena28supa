
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Mock data - in a real app, you would fetch this from your backend
    const mockPlayers: Player[] = [
      {
        id: '1',
        name: 'You',
        avatar: '/placeholder.svg',
        items: [],
        totalValue: 0
      },
      {
        id: '2',
        name: 'Opponent',
        avatar: '/placeholder.svg',
        items: [],
        totalValue: 0
      }
    ];
    
    setPlayers(mockPlayers);
    
    // Start countdown
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
    
    return () => clearInterval(timer);
  }, []);

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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-5xl p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Case Battle #{battleId}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-6xl font-bold text-yellow-400 animate-pulse">
              {countdown}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-8">
          {players.map(player => (
            <div key={player.id} className={`border rounded-lg p-4 ${winner?.id === player.id ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'border-gray-700'}`}>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden mr-3">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold">{player.name}</h3>
                  <p className="text-sm text-gray-400">Total: {player.totalValue} gems</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {spinning ? (
                  Array(3).fill(0).map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        y: [0, -10, 0],
                        rotateZ: [0, 5, -5, 0] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.5,
                        delay: i * 0.1
                      }}
                      className="aspect-square border border-gray-700 rounded flex items-center justify-center bg-gray-800"
                    >
                      <div className="w-12 h-12 bg-gray-700 rounded animate-pulse"></div>
                    </motion.div>
                  ))
                ) : (
                  player.items.map(item => (
                    <div 
                      key={item.id} 
                      className={`aspect-square border-2 ${rarityColors[item.rarity]} rounded flex flex-col items-center justify-center p-2 bg-gray-800`}
                    >
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-contain mb-1" />
                      <p className="text-xs font-medium truncate w-full text-center">{item.name}</p>
                      <p className="text-xs font-bold text-yellow-400">{item.value} gems</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
        
        {winner && (
          <div className="mt-6 text-center">
            <h3 className="text-xl font-bold">
              {winner.id === '1' ? 'You Won!' : `${winner.name} Won!`}
            </h3>
            <p className="text-yellow-400 font-bold">Total Value: {winner.totalValue} gems</p>
            <button 
              onClick={onClose}
              className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-all"
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
