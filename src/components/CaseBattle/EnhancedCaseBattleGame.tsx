
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import LightningEffect from '../GameEffects/LightningEffect';
import { showGameResult } from '../GameResultNotification';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';

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
  team?: number;
}

interface EnhancedCaseBattleGameProps {
  cases: Case[];
  users: User[];
  onFinish?: (users: User[]) => void;
  isCursedMode?: boolean;
  isGroupMode?: boolean;
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

const EnhancedCaseBattleGame: React.FC<EnhancedCaseBattleGameProps> = ({ 
  cases, 
  users, 
  onFinish, 
  isCursedMode = false,
  isGroupMode = false 
}) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<Record<string, Item[]>>({});
  const [currentRoundResults, setCurrentRoundResults] = useState<Record<string, Item>>({});
  const [displayedUsers, setDisplayedUsers] = useState<User[]>(users);
  const [currentCase, setCurrentCase] = useState<Case>(cases[0]);
  const [gameFinished, setGameFinished] = useState(false);
  const [countdownFinished, setCountdownFinished] = useState(false);
  const [waitingForNextRound, setWaitingForNextRound] = useState(false);
  const [userSpinning, setUserSpinning] = useState<Record<string, boolean>>({});
  
  const slotsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { playSound } = useSoundEffect();

  // Filter users based on the selected game mode
  useEffect(() => {
    const filteredUsers = users.filter(user => user.name !== '');
    setDisplayedUsers(filteredUsers);
    
    // Initialize roundResults for each user
    const initialResults: Record<string, Item[]> = {};
    const initialSpinning: Record<string, boolean> = {};
    filteredUsers.forEach(user => {
      initialResults[user.id] = [];
      initialSpinning[user.id] = false;
    });
    setRoundResults(initialResults);
    setUserSpinning(initialSpinning);
    
    // Initialize slotsRefs
    slotsRefs.current = Array(filteredUsers.length).fill(null);
  }, [users]);

  useEffect(() => {
    if (cases.length > 0 && displayedUsers.length > 0) {
      startCountdown();
    }
  }, []);

  useEffect(() => {
    if (countdownFinished && !isSpinning && !waitingForNextRound) {
      startSpinning();
    }
  }, [countdownFinished, isSpinning, waitingForNextRound]);

  useEffect(() => {
    if (waitingForNextRound && currentRound < cases.length && !gameFinished) {
      setCurrentCase(cases[currentRound]);
      const timer = setTimeout(() => {
        setWaitingForNextRound(false);
        setCountdownFinished(false);
        startCountdown();
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentRound >= cases.length && !gameFinished) {
      endGame();
    }
  }, [waitingForNextRound, currentRound, cases.length, gameFinished]);

  const startCountdown = () => {
    setCountdown(3);
    playSound('caseSelect');
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          // Only set countdownFinished to true when countdown reaches 0
          setTimeout(() => {
            setCountdownFinished(true);
            setCountdown(null);
          }, 1000);
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const startSpinning = () => {
    setIsSpinning(true);
    playSound('cardShuffle');
    
    // Set all users to spinning state
    const updatedSpinning = {...userSpinning};
    displayedUsers.forEach(user => {
      updatedSpinning[user.id] = true;
    });
    setUserSpinning(updatedSpinning);
    
    const spinDurations = displayedUsers.map(() => 3000 + Math.random() * 2000);
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
      setCountdownFinished(false);
      
      const newRoundResults = { ...roundResults };
      const newCurrentRoundResults: Record<string, Item> = {};
      const updatedUsers = [...displayedUsers];
      
      updatedUsers.forEach(user => {
        const reward = getRandomItem(currentCase.items || slotMachineItems);
        newCurrentRoundResults[user.id] = reward;
        
        // Add new item to the user's items array
        user.items = [...(user.items || []), reward];
        
        // Add to round results history
        newRoundResults[user.id] = [...(newRoundResults[user.id] || []), reward];
        
        // Update total win value
        user.totalWin = (user.totalWin || 0) + reward.price;
      });
      
      setCurrentRoundResults(newCurrentRoundResults);
      setRoundResults(newRoundResults);
      setDisplayedUsers(updatedUsers);
      
      // Reset all user spinning states
      const resetSpinning = {...userSpinning};
      displayedUsers.forEach(user => {
        resetSpinning[user.id] = false;
      });
      setUserSpinning(resetSpinning);
      
      // Set to wait for next round
      setWaitingForNextRound(true);
      setCurrentRound(prev => prev + 1);
    }, maxDuration + 1000);
  };
  
  const stopSlot = (index: number) => {
    playSound('cardDeal');
  };
  
  const endGame = () => {
    setGameFinished(true);
    
    // Calculate the winner based on the game mode
    const updatedUsers = [...displayedUsers];
    
    // Create teams map for calculation
    const teamsMap: Record<number, User[]> = {};
    const teamTotals: Record<number, number> = {};
    
    updatedUsers.forEach(user => {
      const teamId = user.team || 0;
      if (!teamsMap[teamId]) {
        teamsMap[teamId] = [];
        teamTotals[teamId] = 0;
      }
      teamsMap[teamId].push(user);
      teamTotals[teamId] += user.totalWin;
    });
    
    // Process the total reward
    const totalReward = updatedUsers.reduce((sum, user) => sum + user.totalWin, 0);
    
    if (isGroupMode) {
      // In group mode, split rewards evenly among all players
      const perUserReward = totalReward / updatedUsers.length;
      updatedUsers.forEach(user => {
        user.totalWin = perUserReward;
      });
    } else if (isCursedMode) {
      // In cursed mode, the team with the lowest total wins
      const teams = Object.keys(teamTotals).map(Number);
      const winningTeam = teams.reduce((lowest, team) => 
        teamTotals[team] < teamTotals[lowest] ? team : lowest, teams[0]);
      
      // Calculate the reward for winning team
      const winningTeamSize = teamsMap[winningTeam].length;
      const winningTeamReward = totalReward;
      const perWinnerReward = winningTeamReward / winningTeamSize;
      
      // Assign rewards
      updatedUsers.forEach(user => {
        const isWinner = (user.team || 0) === winningTeam;
        user.totalWin = isWinner ? perWinnerReward : 0;
      });
    } else {
      // Standard mode - find the team with highest total
      const teams = Object.keys(teamTotals).map(Number);
      const winningTeam = teams.reduce((highest, team) => 
        teamTotals[team] > teamTotals[highest] ? team : highest, teams[0]);
      
      // Calculate the reward for winning team
      const winningTeamSize = teamsMap[winningTeam].length;
      const winningTeamReward = totalReward;
      const perWinnerReward = winningTeamReward / winningTeamSize;
      
      // Assign rewards
      updatedUsers.forEach(user => {
        const isWinner = (user.team || 0) === winningTeam;
        user.totalWin = isWinner ? perWinnerReward : 0;
      });
    }
    
    // Set the final displayed users
    setDisplayedUsers(updatedUsers);
    
    toast.success('Battle completed!');
    playSound('plinkoWin');
    
    if (onFinish) {
      onFinish(updatedUsers);
    }
    
    // Show game result notification
    const topWinner = [...updatedUsers].sort((a, b) => b.totalWin - a.totalWin)[0];
    showGameResult({
      success: true,
      message: `${topWinner.name} won the battle!`,
      amount: Math.floor(topWinner.totalWin),
      duration: 5000
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-xl relative">
      {showLightning && <LightningEffect isVisible={true} />}
      
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
        
        {isCursedMode && (
          <div className="mt-2 px-3 py-1 bg-red-900/40 inline-block rounded-md text-red-400 text-sm">
            CURSED MODE: Lowest value wins!
          </div>
        )}
        
        {isGroupMode && (
          <div className="mt-2 px-3 py-1 bg-blue-900/40 inline-block rounded-md text-blue-400 text-sm">
            GROUP MODE: Rewards split evenly
          </div>
        )}
      </div>
      
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
          <div className="text-8xl font-bold text-[#00d7a3] animate-pulse">
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
              {isSpinning && userSpinning[user.id] ? (
                <CaseSlider
                  items={currentCase?.items?.map(item => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                    rarity: item.rarity,
                    price: item.price,
                    playerId: user.id,
                    playerName: user.name,
                    playerTeam: user.team
                  })) || slotMachineItems}
                  onComplete={() => {}}
                  autoSpin={true}
                  playerName={user.name}
                  highlightPlayer={false}
                  isSpinning={userSpinning[user.id]}
                  spinDuration={5000}
                  caseName={currentCase?.name}
                />
              ) : currentRoundResults[user.id] ? (
                <div className="p-2 transition-all duration-300 transform hover:scale-105">
                  <div className={`p-3 rounded-md ${itemRarityColors[currentRoundResults[user.id].rarity]}`}>
                    <img
                      src={currentRoundResults[user.id].image || '/placeholder.svg'}
                      alt={currentRoundResults[user.id].name}
                      className="w-40 h-40 object-contain"
                    />
                    <p className="text-white font-medium text-center mt-2">{currentRoundResults[user.id].name}</p>
                    <p className="text-center text-green-400">${currentRoundResults[user.id].price.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  Waiting to spin...
                </div>
              )}
            </div>
            
            {/* Bottom border that indicates team */}
            {user.team !== undefined && (
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                user.team === 0 ? 'bg-blue-500' : 
                user.team === 1 ? 'bg-red-500' : 
                user.team === 2 ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
            )}
            
            {roundResults[user.id] && roundResults[user.id].length > 0 && (
              <div className="mt-4 border-t-2 border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Items Won:</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                  {roundResults[user.id].map((item, idx) => (
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
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {displayedUsers.map((user) => 
              roundResults[user.id]?.map((item, itemIndex) => (
                <div 
                  key={`${user.id}-result-${itemIndex}`}
                  className={`p-3 rounded-md border-2 ${
                    user.totalWin === Math.max(...displayedUsers.map(u => u.totalWin)) 
                      ? 'border-yellow-400' 
                      : 'border-gray-700'
                  } bg-gray-800`}
                >
                  <div className="flex flex-col items-center">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="w-16 h-16 object-contain mb-2"
                    />
                    <p className="text-white text-sm text-center">{item.name}</p>
                    <p className="text-green-400 text-sm">${item.price.toFixed(2)}</p>
                    <div className="mt-2 text-gray-400 text-xs flex items-center">
                      <div className="w-4 h-4 rounded-full overflow-hidden mr-1">
                        <img src={user.avatar || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate max-w-[80px]">{user.name}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              New Battle
            </Button>
          </div>
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
    totalWin: 0,
    team: 0
  },
  {
    id: '2',
    name: 'Player 2',
    avatar: '/placeholder.svg',
    items: [],
    totalWin: 0,
    team: 1
  }
];

export default EnhancedCaseBattleGame;
