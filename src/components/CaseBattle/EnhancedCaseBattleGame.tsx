import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import LightningEffect from '../GameEffects/LightningEffect';

interface Case {
  id: string;
  name: string;
  price: number;
  image: string;
  items: Item[];
}

interface Item {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface User {
  id: string;
  name: string;
  avatar: string;
  items: Item[];
  totalWin: number;
}

interface EnhancedCaseBattleGameProps {
  cases: Case[];
  users: User[];
  onFinish?: (users: User[]) => void;
}

const itemRarityColors = {
  common: 'border-gray-400 bg-gray-800',
  uncommon: 'border-blue-400 bg-blue-900',
  rare: 'border-purple-400 bg-purple-900',
  epic: 'border-pink-400 bg-pink-900',
  legendary: 'border-yellow-400 bg-yellow-900'
};

const getRandomItem = (items: Item[]) => {
  return items[Math.floor(Math.random() * items.length)];
};

const slotMachineItems = [
  { id: '1', name: 'AK-47', price: 45.50, image: '/placeholder.svg', rarity: 'rare' as const },
  { id: '2', name: 'Desert Eagle', price: 27.80, image: '/placeholder.svg', rarity: 'uncommon' as const },
  { id: '3', name: 'Butterfly Knife', price: 256.30, image: '/placeholder.svg', rarity: 'legendary' as const },
  { id: '4', name: 'AWP Dragon Lore', price: 1854.20, image: '/placeholder.svg', rarity: 'legendary' as const },
  { id: '5', name: 'Glock-18', price: 12.75, image: '/placeholder.svg', rarity: 'common' as const },
  { id: '6', name: 'M4A4 Howl', price: 987.65, image: '/placeholder.svg', rarity: 'epic' as const },
];

const EnhancedCaseBattleGame: React.FC<EnhancedCaseBattleGameProps> = ({ cases, users, onFinish }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<Record<string, Item>>({});
  const [displayedUsers, setDisplayedUsers] = useState<User[]>(users);
  const [currentCase, setCurrentCase] = useState<Case>(cases[0]);
  const [gameFinished, setGameFinished] = useState(false);
  
  const slotsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { playSound } = useSoundEffect();

  useEffect(() => {
    slotsRefs.current = Array(users.length).fill(null);
  }, [users.length]);

  useEffect(() => {
    if (cases.length > 0 && users.length > 0) {
      startCountdown();
    }
  }, []);

  useEffect(() => {
    if (currentRound > 0 && currentRound < cases.length) {
      setCurrentCase(cases[currentRound]);
      const timer = setTimeout(() => {
        startCountdown();
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentRound === cases.length && !gameFinished) {
      endGame();
    }
  }, [currentRound, cases.length]);

  const startCountdown = () => {
    setCountdown(3);
    playSound('caseSelect');
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          startSpinning();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const startSpinning = () => {
    setIsSpinning(true);
    playSound('cardShuffle');
    
    const spinDurations = users.map(() => 3000 + Math.random() * 2000);
    const maxDuration = Math.max(...spinDurations);
    
    spinDurations.forEach((duration, index) => {
      setTimeout(() => {
        stopSlot(index);
      }, duration);
    });
    
    setTimeout(() => {
      setShowLightning(true);
      playSound('lightning');
    }, maxDuration - 1000);
    
    setTimeout(() => {
      setIsSpinning(false);
      setShowLightning(false);
      
      const newRoundResults = { ...roundResults };
      const updatedUsers = [...displayedUsers];
      
      updatedUsers.forEach(user => {
        const reward = getRandomItem(currentCase.items || slotMachineItems);
        newRoundResults[user.id] = reward;
        
        user.items = [...(user.items || []), reward];
        user.totalWin = (user.totalWin || 0) + reward.price;
      });
      
      setRoundResults(newRoundResults);
      setDisplayedUsers(updatedUsers);
      
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
      }, 2000);
    }, maxDuration + 1000);
  };
  
  const stopSlot = (index: number) => {
    playSound('cardDeal');
  };
  
  const endGame = () => {
    setGameFinished(true);
    toast.success('Battle completed!');
    playSound('plinkoWin');
    
    if (onFinish) {
      onFinish(displayedUsers);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-xl relative">
      {showLightning && <LightningEffect />}
      
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {currentCase?.name || 'Case Battle'} 
          {cases.length > 1 && !gameFinished && ` - Round ${currentRound + 1}/${cases.length}`}
        </h2>
        
        {!gameFinished && (
          <Progress
            value={(currentRound / cases.length) * 100}
            className="h-2 bg-gray-700"
          />
        )}
      </div>
      
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
          <div className="text-8xl font-bold text-white animate-pulse">
            {countdown}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {displayedUsers.map((user, index) => (
          <div 
            key={user.id} 
            className={`relative rounded-lg p-4 transition-all duration-300 border-2 ${
              gameFinished && user.totalWin === Math.max(...displayedUsers.map(u => u.totalWin || 0))
                ? 'border-yellow-400 bg-yellow-900/20'
                : 'border-gray-700 bg-gray-800/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={user.avatar || '/placeholder.svg'}
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-bold text-white">{user.name}</h3>
                <p className="text-sm text-green-400">${user.totalWin?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            
            <div
              ref={el => (slotsRefs.current[index] = el)}
              className="h-60 overflow-hidden relative bg-gray-900 rounded-lg flex items-center justify-center mb-4"
            >
              {isSpinning ? (
                <div className="animate-spin-slow">
                  {slotMachineItems.map((item) => (
                    <div key={item.id} className="p-2">
                      <div className={`p-2 rounded-md ${itemRarityColors[item.rarity]}`}>
                        <img
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          className="w-40 h-40 object-contain"
                        />
                        <p className="text-white font-medium text-center mt-1">{item.name}</p>
                        <p className="text-center text-green-400">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : roundResults[user.id] ? (
                <div className="p-2 transition-all duration-300 transform hover:scale-105">
                  <div className={`p-3 rounded-md ${itemRarityColors[roundResults[user.id].rarity]}`}>
                    <img
                      src={roundResults[user.id].image || '/placeholder.svg'}
                      alt={roundResults[user.id].name}
                      className="w-40 h-40 object-contain"
                    />
                    <p className="text-white font-medium text-center mt-2">{roundResults[user.id].name}</p>
                    <p className="text-center text-green-400">${roundResults[user.id].price.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  Waiting to spin...
                </div>
              )}
            </div>
            
            {user.items && user.items.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Rewards:</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                  {user.items.map((item, idx) => (
                    <div 
                      key={`${item.id}-${idx}`} 
                      className={`p-1 rounded-md text-xs ${itemRarityColors[item.rarity]} flex flex-col items-center`}
                    >
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-12 h-12 object-contain"
                      />
                      <p className="truncate w-full text-center text-white">{item.name}</p>
                      <p className="text-green-400">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {gameFinished && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            New Battle
          </Button>
        </div>
      )}
    </div>
  );
};

const mockCases: Case[] = [
  {
    id: '1',
    name: 'Adventure Case',
    price: 49.99,
    image: '/placeholder.svg',
    items: [
      { id: '101', name: 'Desert Eagle', price: 59.99, image: '/placeholder.svg', rarity: 'uncommon' },
      { id: '102', name: 'AK-47 Vulcan', price: 94.50, image: '/placeholder.svg', rarity: 'rare' },
      { id: '103', name: 'Butterfly Knife', price: 230.0, image: '/placeholder.svg', rarity: 'epic' },
    ]
  },
  {
    id: '2',
    name: 'Premium Case',
    price: 99.99,
    image: '/placeholder.svg',
    items: [
      { id: '201', name: 'AWP Dragon Lore', price: 1250.0, image: '/placeholder.svg', rarity: 'legendary' },
      { id: '202', name: 'M4A4 Howl', price: 750.0, image: '/placeholder.svg', rarity: 'epic' },
      { id: '203', name: 'Karambit Fade', price: 870.0, image: '/placeholder.svg', rarity: 'legendary' },
    ]
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Player 1',
    avatar: '/placeholder.svg',
    items: [],
    totalWin: 0
  },
  {
    id: '2',
    name: 'Player 2',
    avatar: '/placeholder.svg',
    items: [],
    totalWin: 0
  }
];

export default EnhancedCaseBattleGame;
