import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Trophy, DollarSign, User, Clock, History } from 'lucide-react';
import HorseIcon from '../components/HorseRacing/HorseIcon';
import PulseAnimation from '../components/GameEffects/PulseAnimation';

// Define our horses
const horses = [
  { id: 1, name: "Thunder Bolt", odds: 4.6, color: "bg-amber-700" },
  { id: 2, name: "Silver Streak", odds: 4.6, color: "bg-slate-400" },
  { id: 3, name: "Lucky Star", odds: 4.6, color: "bg-yellow-500" },
  { id: 4, name: "Night Fury", odds: 4.6, color: "bg-gray-800" },
  { id: 5, name: "Golden Flash", odds: 4.6, color: "bg-orange-600" }
];

// Race track configuration
const RACE_DISTANCE_METERS = 1000; // 1000 meter race

// Simple character with gun
const RaceStarter = ({ isStarting }: { isStarting: boolean }) => {
  return (
    <div className="relative bottom-0 right-0">
      <div className="relative">
        {/* Simple character */}
        <div className="w-12 h-14 relative">
          {/* Red Cap */}
          <div className="w-8 h-3 bg-red-600 absolute left-1/2 top-0 transform -translate-x-1/2 rounded-t-lg z-10"></div>
          <div className="w-10 h-2 bg-red-700 absolute left-1/2 top-2 transform -translate-x-1/2 rounded-sm z-10"></div>
          
          {/* Head */}
          <div className="w-6 h-6 bg-orange-300 rounded-full absolute left-1/2 top-3 transform -translate-x-1/2 z-5"></div>
          
          {/* Face details */}
          <div className="w-3 h-1 bg-slate-800 absolute left-1/2 top-6 transform -translate-x-1/2 z-6"></div>
          
          {/* Blue Shirt */}
          <div className="w-8 h-6 bg-blue-600 absolute left-1/2 top-8 transform -translate-x-1/2 rounded-sm z-5"></div>
          
          {/* Arms */}
          <div className={`w-5 h-2 bg-blue-600 absolute top-9 left-1 transition-all duration-300 ${isStarting ? 'rotate-45' : ''} z-6`}></div>
          
          {/* Gun Arm - animated to point up when race starts */}
          <div className={`w-6 h-2 bg-blue-600 absolute top-9 right-1 origin-left transition-all duration-300 ${isStarting ? '-rotate-90' : ''} z-6`}>
            {/* Gun */}
            <div className="w-4 h-3 bg-gray-800 absolute right-0 top-0 transform -translate-y-1/3 z-7"></div>
          </div>
        </div>
        
        {/* Gun Flash Effect - Enhanced */}
        {isStarting && (
          <div className="absolute -top-12 right-2">
            {/* Large explosion animation */}
            <div className="w-20 h-20 bg-yellow-500 rounded-full animate-ping opacity-90"></div>
            <div className="absolute inset-0 w-16 h-16 bg-orange-500 rounded-full animate-ping opacity-90"></div>
            <div className="absolute inset-0 w-24 h-24 bg-red-500 rounded-full animate-ping opacity-70"></div>
            
            {/* Small explosion particles */}
            <div className="absolute top-2 left-4 w-4 h-4 bg-yellow-300 rounded-full animate-ping opacity-80"></div>
            <div className="absolute top-8 right-2 w-3 h-3 bg-orange-300 rounded-full animate-ping opacity-80"></div>
            <div className="absolute bottom-2 right-8 w-5 h-5 bg-red-300 rounded-full animate-ping opacity-80"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Tribune Section Component - New component for seats under the track
const TribuneSection = ({ isStarting }: { isStarting: boolean }) => {
  return (
    <div className="bg-amber-950/80 rounded-b-lg border-b-2 border-x-2 border-amber-800 p-2 relative h-20">
      {/* Tribune seats background */}
      <div className="flex justify-between mb-2">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="w-12 h-3 bg-amber-800/60 rounded-t-sm"></div>
        ))}
      </div>
      <div className="flex justify-around mb-2">
        {Array(7).fill(0).map((_, i) => (
          <div key={i} className="w-14 h-3 bg-amber-800/70 rounded-t-sm"></div>
        ))}
      </div>
      <div className="flex justify-between">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="w-12 h-3 bg-amber-800/80 rounded-t-sm"></div>
        ))}
      </div>
      
      {/* Character on the right side of tribune */}
      <div className="absolute right-8 bottom-1 z-10">
        <RaceStarter isStarting={isStarting} />
      </div>
    </div>
  );
};

// Previous Winners Component - Redesigned to show more winners without scrollbar
const PreviousWinners = ({ winners }: { winners: Array<{ id: number, name: string, color: string }> }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-t-lg p-3 border border-amber-900/50 mb-2">
      <h3 className="text-white font-semibold flex items-center mb-2 text-sm">
        <History className="w-4 h-4 mr-1 text-amber-500" />
        Previous Winners
      </h3>
      <div className="flex space-x-2 overflow-hidden pb-1 w-full">
        {winners.length === 0 ? (
          <div className="text-gray-400 text-xs italic">No previous races</div>
        ) : (
          winners.slice(0, 8).map((horse, index) => (
            <div key={index} className="flex-shrink-0 flex items-center text-white text-xs bg-gray-800/60 px-2 py-1 rounded whitespace-nowrap">
              <Trophy className={`w-3 h-3 mr-1 ${index === 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
              <div className={`w-3 h-3 ${horse.color} rounded-sm mr-2`}></div>
              <span>{horse.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Dust Effect Component - Fixed to only appear behind horses
const DustEffect = ({ position, lane }: { position: number, lane: number }) => {
  if (position < 5) return null; // No dust at the beginning
  
  return (
    <div 
      className="absolute flex items-center pointer-events-none"
      style={{ 
        bottom: `${lane * 20 + 6}%`, 
        left: `${position - 4}%`, // Slightly closer to horse
        transform: 'translateX(-50%)',
        zIndex: 0 // Absolute lowest z-index to ensure it's always behind horses
      }}
    >
      {/* Dust particles */}
      <div className="relative h-3 w-6">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-amber-200/20 rounded-full animate-ping"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 8}px`,
              left: `${Math.random() * 6}px`,
              animationDuration: `${Math.random() * 0.8 + 0.3}s`,
              animationDelay: `${Math.random() * 0.3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Position Indicator Component - To show race position when finished
const PositionIndicator = ({ position, isWinner }: { position: number, isWinner: boolean }) => {
  let bgColor = "bg-gray-700";
  let textColor = "text-white";
  
  if (position === 1) {
    bgColor = "bg-yellow-500";
    textColor = "text-black";
  } else if (position === 2) {
    bgColor = "bg-gray-400";
    textColor = "text-black";
  } else if (position === 3) {
    bgColor = "bg-amber-700";
    textColor = "text-white";
  }
  
  return (
    <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 ${bgColor} rounded-full w-6 h-6 flex items-center justify-center ${textColor} text-xs font-bold`}>
      {position}
    </div>
  );
};

// Current Bets Display - New component for showing placed bets
const CurrentBetsDisplay = ({ 
  selectedHorse, 
  betAmount, 
  hasBet 
}: { 
  selectedHorse: number | null; 
  betAmount: number; 
  hasBet: boolean;
}) => {
  if (!hasBet || !selectedHorse) return null;
  
  const betHorse = horses.find(h => h.id === selectedHorse);
  if (!betHorse) return null;
  
  return (
    <div className="mt-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700">
      <h3 className="text-xs font-medium mb-2 text-gray-300">Current Bets</h3>
      <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center mr-2">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xs text-white">You</span>
        </div>
        <div className="flex items-center px-2 py-1 bg-gray-800/80 rounded">
          <div className={`w-4 h-4 ${betHorse.color} rounded-sm mr-2 flex items-center justify-center`}>
            <HorseIcon className="text-white w-2 h-2" />
          </div>
          <span className="text-xs text-white">${betAmount}</span>
        </div>
      </div>
    </div>
  );
};

// This is the main component
const HorseRacing = () => {
  const { user, updateUser, addBet } = useUser();
  
  // Betting state
  const [betAmount, setBetAmount] = useState<number>(5);
  const [customBetAmount, setCustomBetAmount] = useState<string>("25");
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [hasBet, setHasBet] = useState<boolean>(false);
  
  // Race state
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [raceCompleted, setRaceCompleted] = useState<boolean>(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [horsePositions, setHorsePositions] = useState<number[]>([0, 0, 0, 0, 0]);
  const [countdown, setCountdown] = useState<number>(0);
  const [timeToNextRace, setTimeToNextRace] = useState<number>(8);
  const [showGunEffect, setShowGunEffect] = useState<boolean>(false);
  
  // Previous winners tracking
  const [previousWinners, setPreviousWinners] = useState<Array<{ id: number, name: string, color: string }>>([]);
  
  // Race results - store finishing positions
  const [raceResults, setRaceResults] = useState<number[]>([]);
  
  // Use refs to track timers and race state
  const raceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextRaceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishedTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // For ensuring races run continuously even when tab is not visible
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const visibilityChangeRef = useRef<boolean>(false);
  
  // Global race state tracking
  const globalRaceState = useRef({
    isRacePending: false,
    raceProgress: 0,
    winnerIndex: -1,
    currentRaceId: 0,
    nextRaceAt: 0
  });
  
  // Initialize game and handle visibility changes
  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page is now visible - sync with global race state
        visibilityChangeRef.current = true;
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = now;
        
        // Check if we need to sync the UI with the actual race state
        syncWithGlobalRaceState();
      }
    };
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start first race immediately
    startNextRaceTimer(8);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupAllTimers();
    };
  }, []);

  // Clean up all timers
  const cleanupAllTimers = () => {
    if (raceTimerRef.current) clearInterval(raceTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (nextRaceTimerRef.current) clearInterval(nextRaceTimerRef.current);
    if (finishedTimerRef.current) clearTimeout(finishedTimerRef.current);
  };
  
  // Sync UI with global race state when tab becomes visible again
  const syncWithGlobalRaceState = () => {
    const now = Date.now();
    const { isRacePending, raceProgress, winnerIndex, nextRaceAt, currentRaceId } = globalRaceState.current;
    
    if (isRacePending) {
      // A race is in progress
      if (raceProgress >= 1) {
        // Race should be finished
        setHorsePositions(Array(5).fill(100));
        setIsRacing(false);
        setRaceCompleted(true);
        setWinner(horses[winnerIndex].id);
        
        // Calculate how long until next race
        const timeRemaining = Math.max(0, nextRaceAt - now);
        const secondsRemaining = Math.ceil(timeRemaining / 1000);
        
        // If next race is soon, start countdown
        if (secondsRemaining <= 8) {
          setTimeToNextRace(secondsRemaining);
          startNextRaceTimer(secondsRemaining);
        }
      } else {
        // Race is still in progress
        updateRacePositions(raceProgress, winnerIndex);
        setIsRacing(true);
        setRaceCompleted(false);
      }
    } else {
      // No race in progress, just waiting for next race
      const timeToRace = Math.max(0, nextRaceAt - now);
      const secondsToRace = Math.ceil(timeToRace / 1000);
      
      if (secondsToRace <= 8) {
        setTimeToNextRace(secondsToRace);
        startNextRaceTimer(secondsToRace);
      }
    }
  };
  
  // Reset positions of all horses
  const resetRace = () => {
    setHorsePositions([0, 0, 0, 0, 0]);
    setWinner(null);
    setRaceCompleted(false);
  };
  
  // Start timer for next race (8 seconds countdown)
  const startNextRaceTimer = (seconds: number) => {
    // Clear any existing timer
    if (nextRaceTimerRef.current) {
      clearInterval(nextRaceTimerRef.current);
    }
    
    // Also clear any other active timers to prevent overlap
    cleanupAllTimers();
    
    // Set initial countdown
    setTimeToNextRace(seconds);
    
    // Determine when the next race will start
    const startTime = Date.now();
    const raceStartsAt = startTime + (seconds * 1000);
    globalRaceState.current.nextRaceAt = raceStartsAt;
    globalRaceState.current.isRacePending = false;
    
    // Countdown timer
    nextRaceTimerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((raceStartsAt - now) / 1000));
      
      setTimeToNextRace(remaining);
      
      if (remaining <= 0) {
        // When countdown reaches 0, start race
        if (nextRaceTimerRef.current) {
          clearInterval(nextRaceTimerRef.current);
          nextRaceTimerRef.current = null;
        }
        startCountdown();
      }
    }, 200);
  };
  
  // Start 3-2-1 countdown before race
  const startCountdown = () => {
    // Reset for new race
    resetRace();
    setIsRacing(false);
    
    // Start countdown from 3
    setCountdown(3);
    
    // Clear any existing countdown
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    // Start countdown
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Countdown complete, start race
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          setTimeout(() => startRace(), 200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Update positions based on race progress
  const updateRacePositions = (progress: number, winnerIndex: number) => {
    setHorsePositions(prev => 
      prev.map((_, i) => {
        // Winner horse moves faster
        const isWinner = i === winnerIndex;
        
        // Calculate position with randomness
        // Winner gets a boost especially near the end
        const horseSpeed = isWinner
          ? progress * 0.9 + 0.1 * Math.random() + (progress * 0.1) 
          : progress * 0.7 + 0.1 * Math.random() + (Math.sin(Date.now() / 200 + i) * 0.05);
        
        // Scale to track percentage (0-100)
        return Math.min(horseSpeed * 100, 100);
      })
    );
  };
  
  // Handle custom bet amount change
  const handleCustomBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomBetAmount(value);
    if (value && parseInt(value) > 0) {
      setBetAmount(parseInt(value));
    }
  };
  
  // Apply custom bet amount
  const applyCustomBet = () => {
    if (customBetAmount && parseInt(customBetAmount) > 0) {
      const amount = parseInt(customBetAmount);
      if (amount > user.balance) {
        toast.error("Bet amount exceeds your balance!");
        return;
      }
      setBetAmount(amount);
    }
  };
  
  // Start the race - fixed position calculation
  const startRace = () => {
    // Show gun effect
    setShowGunEffect(true);
    setTimeout(() => setShowGunEffect(false), 1500);
    
    // Set racing state
    setIsRacing(true);
    setRaceResults([]);
    
    // Clear any existing race
    if (raceTimerRef.current) {
      clearInterval(raceTimerRef.current);
      raceTimerRef.current = null;
    }
    
    // Also clear any other active timers to ensure no race overlap
    cleanupAllTimers();
    
    // Determine winner in advance
    const winnerIndex = Math.floor(Math.random() * horses.length);
    const winnerHorseId = horses[winnerIndex].id; // Store the actual horse ID
    const raceId = Date.now();
    
    // Update global race state
    globalRaceState.current = {
      isRacePending: true,
      raceProgress: 0,
      winnerIndex,
      currentRaceId: raceId,
      nextRaceAt: Date.now() + 15000 // Approximate time until next race
    };
    
    // Track race progress
    let raceProgress = 0;
    const raceSpeed = 0.02 + (Math.random() * 0.01); // Faster race speed (2-3% per tick)
    const startTime = Date.now();
    
    // Start race simulation
    raceTimerRef.current = setInterval(() => {
      // Update race progress
      raceProgress += raceSpeed;
      globalRaceState.current.raceProgress = raceProgress;
      
      if (raceProgress >= 1) {
        // Race is complete
        if (raceTimerRef.current) {
          clearInterval(raceTimerRef.current);
          raceTimerRef.current = null;
        }
        
        // Make one final update to horse positions to ensure we capture exact positions
        // This is done by directly calculating the positions rather than using setState
        const currentPositions = horsePositions.map((pos, i) => {
          // Similar logic to updateRacePositions but applied directly
          const isWinner = i === winnerIndex;
          const horseSpeed = isWinner
            ? raceProgress * 0.9 + 0.1 * Math.random() + (raceProgress * 0.1) 
            : raceProgress * 0.7 + 0.1 * Math.random() + (Math.sin(Date.now() / 200 + i) * 0.05);
          
          // Convert to percentage, keeping current progress if it's higher
          return Math.max(Math.min(horseSpeed * 100, 100), pos);
        });
        
        // Create final positions array, preserving current progress for all horses
        const finalHorsePositions = [...currentPositions];
        
        // Only set the winner to 100% if not already there
        // This preserves other horses' actual positions
        finalHorsePositions[winnerIndex] = 100;
        
        // Update UI with final positions
        setHorsePositions(finalHorsePositions);
        
        // Calculate distances in meters based on final positions
        const finalDistances = finalHorsePositions.map(position => 
          Math.round((position / 100) * RACE_DISTANCE_METERS)
        );
        
        // Ensure winner has maximum distance
        finalDistances[winnerIndex] = RACE_DISTANCE_METERS;
        
        // Create ranking array with complete horse data
        const horsesWithRanking = horses.map((horse, index) => ({
          id: horse.id,
          index,
          name: horse.name,
          position: finalHorsePositions[index], // Keep actual percentage position
          distance: finalDistances[index],      // Keep actual distance
          isWinner: index === winnerIndex
        }));
        
        // Sort by distance descending, with winner always first
        const sortedHorses = [...horsesWithRanking].sort((a, b) => {
          // Winner is always first
          if (a.isWinner !== b.isWinner) {
            return a.isWinner ? -1 : 1;
          }
          
          // Otherwise, sort by distance (higher is better)
          return b.distance - a.distance;
        });
        
        // Create results array with finish positions (1st, 2nd, etc.)
        const finishResults = Array(horses.length).fill(0);
        
        // Assign positions based on sorted order
        sortedHorses.forEach((horse, index) => {
          finishResults[horse.index] = index + 1;
        });
        
        // Set race results and state
        setRaceResults(finishResults);
        setIsRacing(false);
        setRaceCompleted(true);
        
        // Set the winner ID
        setWinner(winnerHorseId);
        
        const winningHorse = horses[winnerIndex];
        
        // Add winner to previous winners list
        setPreviousWinners(prev => {
          const newWinners = [{
            id: winningHorse.id,
            name: winningHorse.name,
            color: winningHorse.color
          }, ...prev.slice(0, 9)]; // Keep only the 10 most recent winners
          return newWinners;
        });
        
        // Handle bet results
        if (selectedHorse && hasBet) {
          // Check if the selected horse matches the winner
          if (selectedHorse === winnerHorseId) {
            const horse = horses.find(h => h.id === selectedHorse);
            if (horse) {
              // Calculate and update winnings
              const winAmount = Math.round(betAmount * horse.odds * 100) / 100;
              updateUser({ ...user, balance: user.balance + winAmount });
              toast.success(`You won $${winAmount.toFixed(2)}!`);
            }
          } else {
            toast.error(`${horses.find(h => h.id === selectedHorse)?.name} didn't win. Better luck next time!`);
          }
        }
        
        // Only show race finished for 3 seconds, then start next race countdown
        if (finishedTimerRef.current) {
          clearTimeout(finishedTimerRef.current);
        }
        
        // Use a flag to prevent race overlap
        let raceFinishedHandled = false;
        
        finishedTimerRef.current = setTimeout(() => {
          if (raceFinishedHandled) return; // Prevent duplicate handling
          raceFinishedHandled = true;
          
          setHasBet(false);
          setRaceCompleted(false); // Explicitly hide race completed 
          resetRace(); // Reset positions before starting countdown
          
          // Ensure a consistent 8-second gap between races
          startNextRaceTimer(8); // 8 second countdown to next race
          
          // Update global race state
          globalRaceState.current.isRacePending = false;
          globalRaceState.current.nextRaceAt = Date.now() + 8000;
        }, 3000); // Show race finished for EXACTLY 3 seconds
      } else {
        // Update horse positions during the race
        updateRacePositions(raceProgress, winnerIndex);
      }
    }, 50);
  };
  
  // Handle bet amount changes
  const handleBet = (amount: number) => {
    setBetAmount(amount);
  };

  // Handle horse selection
  const handleSelectHorse = (horseId: number) => {
    setSelectedHorse(horseId);
  };
  
  // Place bet on selected horse
  const placeBet = () => {
    if (!selectedHorse) {
      toast.error("Please select a horse first");
      return;
    }
    
    if (user.balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }
    
    // Deduct the bet amount from balance
    updateUser({ ...user, balance: user.balance - betAmount });
    
    // Add to wagered amount
    addBet(betAmount);
    
    setHasBet(true);
    
    const selectedHorseName = horses.find(h => h.id === selectedHorse)?.name;
    toast.success(`Bet placed on ${selectedHorseName}. Good luck!`);
  };
  
  // Render the UI
  return (
    <div className="container mx-auto py-4 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <HorseIcon className="w-8 h-8 text-green-500 mr-2" />
          <h1 className="text-2xl font-bold">Horse Racing</h1>
        </div>
        <div className="bg-gray-800 p-2 rounded-lg flex items-center">
          <DollarSign className="text-yellow-500 w-5 h-5 mr-1" />
          <span className="text-white font-bold">${user.balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              Race Track <span className="ml-2 text-sm text-gray-400 font-normal">({RACE_DISTANCE_METERS}m)</span>
            </h2>
            
            <PulseAnimation isActive={isRacing || countdown > 0} className="flex items-center bg-blue-900 rounded-lg px-3 py-1">
              <Clock className="h-4 w-4 text-blue-300 mr-2" />
              <span className="text-white">
                {isRacing ? "Race in progress" : 
                 countdown > 0 ? `Race starts in ${countdown}...` : 
                 raceCompleted ? "Race finished" : 
                 `Next race in ${timeToNextRace}s`}
              </span>
            </PulseAnimation>
          </div>
          
          {/* Previous Winners Display - Now above the race track */}
          <PreviousWinners winners={previousWinners} />
          
          {/* Main race track display */}
          <div className="relative bg-gradient-to-b from-green-800 to-green-900 rounded-t-lg p-4 min-h-[400px] border-t-2 border-x-2 border-green-800 overflow-hidden">
            {/* Sky and background - removed sun element */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/30 to-transparent"></div>
            </div>
            
            {/* Track background with lanes - ensure consistent lanes across whole track */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {horses.map((_, index) => (
                <div key={index} className="border-b border-dashed border-green-700 h-[20%] flex items-center">
                  <div className="w-full bg-green-800/50 h-2 opacity-30"></div>
                </div>
              ))}
            </div>
            
            {/* Distance markers */}
            <div className="absolute bottom-0 w-full flex justify-between px-8 text-xs text-white/70">
              <div className="flex flex-col items-center">
                <div className="h-4 w-0.5 bg-white/30"></div>
                <span>Start</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-4 w-0.5 bg-white/30"></div>
                <span>250m</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-4 w-0.5 bg-white/30"></div>
                <span>500m</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-4 w-0.5 bg-white/30"></div>
                <span>750m</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-4 w-0.5 bg-white/30"></div>
                <span>Finish</span>
              </div>
            </div>
            
            {/* Continuous fence along the track */}
            <div className="absolute left-0 right-0 bottom-10 h-2 flex justify-evenly">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="h-3 w-1 bg-red-900 mx-1"></div>
              ))}
            </div>
            
            {/* Finish line - moved to position 95% to match where horses finish */}
            <div className="absolute top-0 right-[5%] h-full w-2 bg-white bg-opacity-70 flex flex-col">
              <div className="h-full w-full bg-black bg-opacity-50 flex flex-col gap-1">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i} className="h-[10%] bg-white"></div>
                ))}
              </div>
            </div>
            
            {/* Dust effects - only behind horses */}
            {isRacing && horsePositions.map((position, index) => (
              position > 5 && <DustEffect key={`dust-${index}`} position={position} lane={index} />
            ))}
            
            {/* Horses - ensure horses cross finish line */}
            {horses.map((horse, index) => {
              // Position is clamped between 3 and 95 - allow horses to reach finish line
              const position = Math.min(Math.max(horsePositions[index], 3), 95);
              const isSelected = selectedHorse === horse.id;
              const isWinner = winner === horse.id;
              const finishPosition = raceResults[index] || 0;
              
              // Calculate actual distance based on track percentage
              const currentDistance = Math.round((horsePositions[index] / 100) * RACE_DISTANCE_METERS);
              
              return (
                <div 
                  key={horse.id} 
                  className="absolute flex items-center"
                  style={{ 
                    bottom: `${index * 20 + 6}%`, 
                    left: `${position}%`, 
                    transform: 'translateX(-50%)',
                    transition: 'left 0.3s ease-out',
                    zIndex: 20 // Keep horses at higher z-index
                  }}
                >
                  <PulseAnimation isActive={isWinner && raceCompleted}>
                    <div className={`w-10 h-6 ${horse.color} rounded-md flex items-center justify-center relative ${isSelected && hasBet ? 'ring-2 ring-yellow-500' : ''}`}>
                      <HorseIcon className="text-white w-4 h-4" />
                      
                      {raceCompleted && finishPosition > 0 && (
                        <PositionIndicator position={finishPosition} isWinner={isWinner} />
                      )}
                      
                      {/* Distance marker */}
                      {(isRacing || raceCompleted) && (
                        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800/80 text-white text-[10px] px-1 rounded">
                          {currentDistance}m
                        </div>
                      )}
                      
                      {isSelected && hasBet && (
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                          <div className="bg-yellow-500 text-xs px-1 rounded text-black font-bold">
                            YOU
                          </div>
                        </div>
                      )}
                      {isWinner && (
                        <div className="absolute -top-5 right-0 transform translate-x-full">
                          <Trophy className="text-yellow-500 w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </PulseAnimation>
                </div>
              );
            })}
          </div>
          
          {/* Tribune Section - New section under the race track */}
          <TribuneSection isStarting={showGunEffect} />
          
          {/* Race results */}
          {raceCompleted && winner && (
            <div className="mt-4 bg-gray-800 rounded-lg p-4 text-white">
              <h3 className="text-lg font-bold flex items-center">
                <Trophy className="text-yellow-500 w-5 h-5 mr-2" />
                Race Results
              </h3>
              <p className="mt-2">
                {winner === selectedHorse && hasBet
                  ? `Congratulations! ${horses.find(h => h.id === winner)?.name} won the race!` 
                  : `${horses.find(h => h.id === winner)?.name} won the race. ${hasBet ? "Better luck next time!" : ""}`}
              </p>
              
              {/* Detailed race results */}
              <div className="mt-3 grid grid-cols-5 gap-2">
                {horses.map((horse, index) => {
                  const position = raceResults[index] || 0;
                  return (
                    <div key={horse.id} className="flex flex-col items-center bg-gray-700/50 p-2 rounded">
                      <div className={`w-6 h-6 ${horse.color} rounded-md flex items-center justify-center mb-1`}>
                        <span className="text-white font-bold text-xs">{position}</span>
                      </div>
                      <span className="text-xs text-center">{horse.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Card className="bg-gray-900 border-none shadow-lg text-white">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-3">Place Your Bet</h2>
              
              <div className="mb-4">
                <h3 className="text-xs font-medium mb-2">Custom Bet Amount</h3>
                
                {/* Custom bet input */}
                <div className="relative flex items-center mb-3">
                  <span className="absolute left-3 text-gray-400">$</span>
                  <input
                    type="text"
                    value={customBetAmount}
                    onChange={handleCustomBetAmountChange}
                    onBlur={applyCustomBet}
                    onKeyPress={(e) => e.key === 'Enter' && applyCustomBet()}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
                    placeholder="Enter bet amount"
                    disabled={isRacing || hasBet}
                  />
                  <Button
                    onClick={applyCustomBet}
                    disabled={isRacing || hasBet}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 py-1 h-8"
                    size="sm"
                  >
                    Set
                  </Button>
                </div>
                
                {/* Predefined amounts (second row only) */}
                <div className="grid grid-cols-4 gap-2">
                  {[100, 250, 500, 1000].map(amount => (
                    <Button
                      key={amount}
                      variant={betAmount === amount ? "default" : "outline"}
                      className={betAmount === amount ? "bg-green-600 hover:bg-green-700 py-1 text-xs" : "border-gray-700 text-white py-1 text-xs"}
                      onClick={() => handleBet(amount)}
                      disabled={isRacing || hasBet}
                      size="sm"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator className="bg-gray-700 my-3" />
              
              <div className="mb-4">
                <h3 className="text-xs font-medium mb-2">Select Horse</h3>
                <div className="space-y-1.5">
                  {horses.map(horse => (
                    <motion.div
                      key={horse.id}
                      whileHover={!isRacing && !hasBet ? { scale: 1.02, x: 3 } : {}}
                      whileTap={!isRacing && !hasBet ? { scale: 0.98 } : {}}
                      className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        selectedHorse === horse.id 
                          ? 'bg-gray-800 border-green-500' 
                          : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => !isRacing && !hasBet && handleSelectHorse(horse.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 ${horse.color} rounded-md mr-2 flex items-center justify-center`}>
                          <HorseIcon className="text-white w-3 h-3" />
                        </div>
                        <span className="text-sm">{horse.name}</span>
                      </div>
                      <div className="text-yellow-500 font-bold text-sm">
                        {horse.odds}x
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-400 text-xs">
                <p>Bet: ${betAmount}</p>
                {selectedHorse && (
                  <p>Potential win: ${(betAmount * (horses.find(h => h.id === selectedHorse)?.odds || 0)).toFixed(2)}</p>
                )}
              </div>
              
              <div className="mt-3">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 py-1 text-sm"
                  size="sm"
                  disabled={!selectedHorse || isRacing || hasBet || user.balance < betAmount}
                  onClick={placeBet}
                >
                  Place Bet
                </Button>
              </div>
              
              {!selectedHorse && !hasBet && (
                <div className="mt-3 bg-blue-900/50 p-2 rounded text-blue-300 text-xs">
                  Select a horse to place your bet!
                </div>
              )}
              
              {selectedHorse && !hasBet && user.balance < betAmount && (
                <div className="mt-3 bg-red-900/50 p-2 rounded text-red-300 text-xs">
                  Insufficient balance to place this bet.
                </div>
              )}
              
              {hasBet && selectedHorse && (
                <div className="mt-3 bg-green-900/50 p-2 rounded text-green-300 text-xs flex items-center">
                  <Trophy className="w-3 h-3 mr-1" />
                  Your bet on {horses.find(h => h.id === selectedHorse)?.name} is ready!
                </div>
              )}
            </div>
          </Card>
          
          {/* Current Bets section - Now moved underneath the betting card */}
          {hasBet && selectedHorse && (
            <CurrentBetsDisplay 
              selectedHorse={selectedHorse} 
              betAmount={betAmount}
              hasBet={hasBet}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HorseRacing;
