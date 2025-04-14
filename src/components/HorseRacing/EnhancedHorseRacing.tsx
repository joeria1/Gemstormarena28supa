import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { DollarSign, Flag, RotateCcw, Trophy, User } from 'lucide-react';
import PulseAnimation from '../GameEffects/PulseAnimation';
import ItemGlowEffect from '../GameEffects/ItemGlowEffect';

interface Horse {
  id: number;
  name: string;
  color: string;
  position: number;
  speed: number;
  baseSpeed: number;
  finished: boolean;
  finishTime: number | null;
  avatar: string;
}

const EnhancedHorseRacing = () => {
  const { user, updateBalance } = useUser();

  const [horses, setHorses] = useState<Horse[]>([]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [raceResults, setRaceResults] = useState<Horse[]>([]);
  const [balance, setBalance] = useState(user?.balance || 1000);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const trackLength = 800; // Length of the race track in pixels
  const numberOfHorses = 4;
  const finishLineOffset = 50; // Offset to ensure the horse crosses the finish line

  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user]);

  // Initialize horses only once
  const initialHorses = useRef<Horse[]>([]);
  if (initialHorses.current.length === 0) {
    initialHorses.current = Array.from({ length: numberOfHorses }, (_, index) => ({
      id: index + 1,
      name: `Horse ${index + 1}`,
      color: ['red', 'blue', 'green', 'yellow'][index],
      position: 0,
      speed: 0,
      baseSpeed: 2 + Math.random() * 3,
      finished: false,
      finishTime: null,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${index + 1}`
    }));
  }

  useEffect(() => {
    setHorses(initialHorses.current);
  }, []);

  const startRace = () => {
    // Reset all state before starting a new race
    setRaceStarted(true);
    setRaceFinished(false);
    setWinner(null);
    
    // Important: Reset the horses to their initial positions and speed
    setHorses(horses.map(horse => ({
      ...horse,
      position: 0,
      finished: false,
      finishTime: null,
      baseSpeed: 2 + Math.random() * 3 // Regenerate random base speed for each race
    })));
    
    // Reset the countdown
    setCountdown(3);
    
    // Start the countdown timer with delays between each number
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            setRaceInProgress(true);
            startHorseMovement();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startHorseMovement = () => {
    // Reset race timing
    const startTime = performance.now();
    let lastTime = startTime;
    
    const animate = (currentTime: number) => {
      if (!raceInProgress) return;
      
      const deltaTime = (currentTime - lastTime) / 1000; // in seconds
      lastTime = currentTime;
      
      setHorses(prevHorses => {
        const updatedHorses = prevHorses.map(horse => {
          if (horse.finished) return horse;
          
          const speedIncrease = 1 + Math.random() * 0.5; // Add a bit of variance to the speed
          const newPosition = horse.position + horse.baseSpeed * speedIncrease * deltaTime * 100;
          
          if (newPosition >= trackLength + finishLineOffset) {
            return {
              ...horse,
              position: trackLength + finishLineOffset,
              finished: true,
              finishTime: currentTime - startTime
            };
          }
          
          return { ...horse, position: newPosition };
        });
        
        return updatedHorses;
      });
      
      setElapsedTime(currentTime - startTime);
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Check for race finish
      if (!raceFinished && horses.every(horse => horse.finished)) {
        finishRace();
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const finishRace = () => {
    setRaceInProgress(false);
    setRaceFinished(true);
    
    const finishedHorses = horses.filter(horse => horse.finished)
                                .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));
    
    setRaceResults(finishedHorses);
    const winningHorse = finishedHorses[0];
    setWinner(winningHorse);
    
    if (selectedHorse && winningHorse && selectedHorse.id === winningHorse.id) {
      // Calculate payout (e.g., 3x the bet amount)
      const payout = betAmount * 3;
      updateBalance(payout);
      setBalance(prev => prev + payout);
      toast.success(`Horse ${winningHorse.name} won! You won $${payout}!`);
    } else {
      toast.error(`Horse ${winningHorse?.name} won! You lost your bet.`);
    }
  };

  const resetRace = () => {
    // Stop all animations and timers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset state
    setRaceStarted(false);
    setRaceInProgress(false);
    setRaceFinished(false);
    setElapsedTime(0);
    setWinner(null);
    setHorses(initialHorses.current); // Reset to completely fresh horses
    setCountdown(3);
    setRaceResults([]);
    
    // Ready for new bets
    setSelectedHorse(null);
  };

  const handleHorseSelect = (horse: Horse) => {
    setSelectedHorse(horse);
  };

  const handleBetAmountChange = (amount: number) => {
    if (user && amount > user.balance) {
      toast.error("You don't have enough balance to place this bet.");
      return;
    }
    setBetAmount(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900/40 to-gray-900 text-white p-4 md:p-8 rounded-xl border-2 border-green-800/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-800/20 to-green-900/10 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik01NCA0OEw2IDQ4TDYgNnY0OGg0OHoiIGZpbGw9Imdyb3VwIiBvcGFjaXR5PSIwLjAyIiAvPgogICAgPHBhdGggZD0iTTEyIDEySDE4VjE4SDI0VjI0SDMwVjEySDM2VjEySDQyVjE4SDQ4VjMwSDQyVjM2SDM2VjQySDMwVjQ4SDI0VjQySDEyVjM2SDZWMzBIMTJWMjRIMTJWMTJaIgogICAgICAgIHN0cm9rZT0iIzBmNjYzMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==')] opacity-10 z-0"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
          Enhanced Horse Racing
        </h1>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm">
            <DollarSign className="mr-2 text-yellow-400" />
            <span className="text-xl font-bold">{balance.toFixed(2)}</span>
          </div>

          <div className="flex items-center">
            <span className="mr-3">Bet Amount:</span>
            <Button 
              onClick={() => handleBetAmountChange(Math.max(10, betAmount - 10))}
              disabled={betAmount <= 10}
              className="bg-red-900/50 border-red-500/50 text-white hover:bg-red-800 rounded-full w-10 h-10"
            >
              -
            </Button>
            <span className="mx-2 text-xl font-bold text-yellow-400">{betAmount}</span>
            <Button 
              onClick={() => handleBetAmountChange(Math.min(user?.balance || 1000, betAmount + 10))}
              disabled={betAmount >= (user?.balance || 1000)}
              className="bg-green-900/50 border-green-500/50 text-white hover:bg-green-800 rounded-full w-10 h-10"
            >
              +
            </Button>
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Select Your Horse:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {horses.map(horse => (
              <PulseAnimation isActive={selectedHorse?.id === horse.id} key={horse.id}>
                <button
                  onClick={() => handleHorseSelect(horse)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-300 ${
                    selectedHorse?.id === horse.id ? 'border-green-500 bg-green-900/20' : 'border-gray-700 hover:border-white'
                  }`}
                >
                  <img src={horse.avatar} alt={horse.name} className="w-16 h-16 rounded-full mb-2" />
                  <span className="text-lg font-semibold">{horse.name}</span>
                </button>
              </PulseAnimation>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-600 transform -translate-y-1/2 z-0"></div>
          {horses.map(horse => (
            <ItemGlowEffect 
              key={horse.id}
              isActive={raceFinished && winner?.id === horse.id}
              color={horse.color}
            >
              <div
                key={horse.id}
                className={`absolute top-1/2 left-0 h-12 w-12 rounded-full border-4 border-white flex items-center justify-center z-10 transition-transform duration-100`}
                style={{
                  backgroundColor: horse.color,
                  transform: `translateX(${horse.position}px) translateY(-50%)`
                }}
              >
                <img src={horse.avatar} alt={horse.name} className="w-8 h-8 rounded-full" />
              </div>
            </ItemGlowEffect>
          ))}
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-yellow-500 z-20"></div>
        </div>

        <div className="mt-6 text-center">
          {!raceStarted && (
            <Button 
              onClick={startRace}
              disabled={!selectedHorse || raceStarted || (user && user.balance < betAmount)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg border border-blue-400/30 shadow-lg"
            >
              {user && user.balance < betAmount ? "Insufficient Balance" : "Start Race"}
            </Button>
          )}
          {raceStarted && !raceFinished && (
            <div className="text-2xl font-bold text-yellow-400">
              {raceInProgress ? "Racing..." : `Race starts in ${countdown}...`}
            </div>
          )}
          {raceFinished && winner && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-green-400">
                {winner.id === selectedHorse?.id ? "You Won!" : "Race Finished!"}
              </h2>
              <p className="text-gray-300">
                {winner.id === selectedHorse?.id
                  ? `Horse ${winner.name} won! You won $${betAmount * 3}!`
                  : `Horse ${winner.name} won!`}
              </p>
              <Button 
                onClick={resetRace}
                className="mt-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold flex items-center justify-center py-3 rounded-lg border border-indigo-400/30"
              >
                <RotateCcw className="mr-2" size={16} />
                Reset Race
              </Button>
            </div>
          )}
        </div>

        {raceResults.length > 0 && (
          <div className="mt-8 bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Race Results:</h2>
            <ul>
              {raceResults.map((horse, index) => (
                <li key={horse.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center">
                    <span className="mr-2">{index + 1}.</span>
                    <img src={horse.avatar} alt={horse.name} className="w-6 h-6 rounded-full mr-2" />
                    <span>{horse.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {horse.finishTime ? (horse.finishTime / 1000).toFixed(2) : 'N/A'} seconds
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHorseRacing;
