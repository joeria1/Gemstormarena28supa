
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import HorseIcon from './HorseIcon';

// Using constants for better readability
const NUM_HORSES = 5;
const TRACK_LENGTH = 90;
const MIN_SPEED = 0.5;
const MAX_SPEED = 2.0;
const UPDATE_INTERVAL = 100; // milliseconds
const DEFAULT_BET_AMOUNT = 10;

interface Horse {
  id: number;
  position: number;
  color: string;
  speed: number;
  odds: number;
  finished: boolean;
}

interface BetState {
  amount: number;
  selectedHorse: number | null;
  isRaceStarted: boolean;
  isPlacingBet: boolean;
}

const COLORS = ['red', 'blue', 'green', 'purple', 'orange'];

const EnhancedHorseRacing: React.FC = () => {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [betState, setBetState] = useState<BetState>({
    amount: DEFAULT_BET_AMOUNT,
    selectedHorse: null,
    isRaceStarted: false,
    isPlacingBet: false,
  });
  const [balance, setBalance] = useState(1000);

  const raceInterval = useRef<number | null>(null);
  const initalRaceSetup = useRef(false);

  // Initialize horses on component mount
  useEffect(() => {
    if (!initalRaceSetup.current) {
      initializeRace();
      initalRaceSetup.current = true;
    }
  }, []);

  // Initialize horses with random speeds and odds
  const initializeRace = () => {
    const newHorses: Horse[] = Array.from({ length: NUM_HORSES }, (_, i) => {
      const baseSpeed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
      // Calculate odds inversely proportional to speed (faster horses have lower odds)
      const odds = Math.round((1 / baseSpeed) * 5 * 100) / 100;
      
      return {
        id: i,
        position: 0,
        color: COLORS[i],
        speed: baseSpeed,
        odds: odds,
        finished: false,
      };
    });
    
    // Sort horses by odds for display
    newHorses.sort((a, b) => a.odds - b.odds);
    
    setHorses(newHorses);
    setRaceInProgress(false);
    setWinner(null);
    setBetState({
      amount: DEFAULT_BET_AMOUNT,
      selectedHorse: null,
      isRaceStarted: false,
      isPlacingBet: false,
    });
  };

  const startRace = () => {
    if (raceInProgress) return;
    
    // Check if a bet is placed
    if (betState.selectedHorse === null) {
      toast.error("Please select a horse to bet on");
      return;
    }
    
    if (betState.amount <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }
    
    if (betState.amount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    
    // Update balance after betting
    setBalance(prev => prev - betState.amount);
    setBetState(prev => ({ ...prev, isRaceStarted: true }));
    setRaceInProgress(true);
    
    if (raceInterval.current) clearInterval(raceInterval.current);
    
    // Start the race animation
    raceInterval.current = window.setInterval(() => {
      setHorses(prevHorses => {
        const updatedHorses = [...prevHorses];
        let allFinished = true;
        
        for (const horse of updatedHorses) {
          if (!horse.finished) {
            // Add random variation to speed for more realistic race
            const randomVariation = Math.random() * 0.5 - 0.25;
            const adjustedSpeed = horse.speed + randomVariation;
            
            // Update horse position
            horse.position += adjustedSpeed;
            
            // Check if horse has finished
            if (horse.position >= TRACK_LENGTH) {
              horse.position = TRACK_LENGTH;
              horse.finished = true;
              
              // Set as winner if no winner yet
              if (!winner) {
                setWinner(horse);
                
                // Handle betting outcome
                if (betState.selectedHorse === horse.id) {
                  const winnings = Math.round(betState.amount * horse.odds);
                  setBalance(prev => prev + winnings);
                  toast.success(`You won ${winnings} coins!`);
                } else {
                  toast.error("Better luck next time!");
                }
              }
            } else {
              allFinished = false;
            }
          }
        }
        
        // End race if all horses finished
        if (allFinished && raceInterval.current) {
          clearInterval(raceInterval.current);
          raceInterval.current = null;
        }
        
        return updatedHorses;
      });
    }, UPDATE_INTERVAL);
  };

  const resetRace = () => {
    // Clear any existing race interval
    if (raceInterval.current) {
      clearInterval(raceInterval.current);
      raceInterval.current = null;
    }
    
    // Completely reinitialize the race with the same logic as when the page was first loaded
    initializeRace();
  };

  const selectHorse = (horseId: number) => {
    if (!raceInProgress) {
      setBetState(prev => ({ ...prev, selectedHorse: horseId }));
    }
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseInt(e.target.value) || 0;
    setBetState(prev => ({ ...prev, amount }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Horse Racing</h1>
        <p className="text-gray-400">Place your bets and watch the race!</p>
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Balance: {balance} coins</h2>
          {!raceInProgress && (
            <button
              onClick={resetRace}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              New Race
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-1">Bet Amount</label>
            <input
              type="number"
              value={betState.amount}
              onChange={handleBetAmountChange}
              disabled={raceInProgress}
              className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              min="1"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-1">Selected Horse</label>
            <div className="p-2 bg-gray-700 rounded border border-gray-600 text-white">
              {betState.selectedHorse !== null
                ? `Horse ${betState.selectedHorse + 1} (${horses[betState.selectedHorse]?.color})`
                : "None selected"}
            </div>
          </div>
        </div>

        <button
          onClick={startRace}
          disabled={raceInProgress}
          className={`w-full py-3 rounded-lg font-bold ${
            raceInProgress
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 transition"
          }`}
        >
          {raceInProgress ? "Race in Progress..." : "Start Race"}
        </button>
      </div>

      <div className="overflow-hidden flex-grow relative bg-gray-800 rounded-lg">
        {/* Finish line */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />
        
        {/* Race tracks */}
        <div className="p-4">
          {horses.map((horse) => (
            <div 
              key={horse.id}
              onClick={() => selectHorse(horse.id)}
              className={`mb-4 flex items-center cursor-pointer relative ${
                betState.selectedHorse === horse.id ? "bg-gray-700" : ""
              } hover:bg-gray-700 p-2 rounded-lg transition`}
            >
              <div className="w-24 flex flex-col items-center mr-4">
                <HorseIcon color={horse.color} />
                <span className="text-sm mt-1">Horse {horse.id + 1}</span>
                <span className="text-xs text-gray-400">Odds: {horse.odds}x</span>
              </div>
              
              <div className="flex-1 h-6 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    horse.id === betState.selectedHorse ? "bg-purple-600" : `bg-${horse.color}-500`
                  }`}
                  style={{
                    width: `${(horse.position / TRACK_LENGTH) * 100}%`,
                    backgroundColor: horse.color,
                    transition: "width 0.1s ease-out"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {winner && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">
            Horse {winner.id + 1} ({winner.color}) Won!
          </h2>
          <p className="mb-4">
            {betState.selectedHorse === winner.id
              ? `You won ${Math.round(betState.amount * winner.odds)} coins!`
              : "Better luck next time!"}
          </p>
          <button
            onClick={resetRace}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition"
          >
            New Race
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedHorseRacing;
