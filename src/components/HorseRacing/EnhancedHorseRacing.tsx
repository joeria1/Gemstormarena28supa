import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { DollarSign, Flag, RotateCcw, Trophy, User, Trees, Volume2 } from 'lucide-react';
import PulseAnimation from '../GameEffects/PulseAnimation';
import ItemGlowEffect from '../GameEffects/ItemGlowEffect';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import { forcePlaySound, playGameSound, pauseGameSound } from '../../utils/gameSounds';

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
  const { playSound } = useSoundEffect();

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
  const [raceNumber, setRaceNumber] = useState(0); // Track race number to completely reset between races

  // Sound effect reference for clean-up
  const gallopingSoundRef = useRef<number | null>(null);

  // Animation refs
  const animationFrameId = useRef<number | null>(null);
  const countdownTimerId = useRef<NodeJS.Timeout | null>(null);
  const raceTimerId = useRef<NodeJS.Timeout | null>(null);
  const raceStartTime = useRef<number | null>(null);

  const trackLength = 800; // Length of the race track in pixels
  const numberOfHorses = 4;
  const finishLineOffset = 50; // Offset to ensure the horse crosses the finish line

  // Horse speed settings
  const minBaseSpeed = 1.5;
  const maxBaseSpeed = 3.0;
  const maxSpeedVariance = 0.2; // Maximum variance as a percentage of base speed

  // Initialize horses with names and colors
  const horseNames = ["Thunderbolt", "Silver Storm", "Golden Arrow", "Midnight Star"];
  const horseColors = ["#8B4513", "#C0C0C0", "#FFD700", "#191970"]; // Brown, Silver, Gold, Navy
  
  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user]);

  // Initialize horses only once
  useEffect(() => {
    initializeHorses();
    
    // Preload race sounds
    setTimeout(() => {
      // Force-load but silent play of race sounds to ensure they're cached
      const sounds = ['raceStart', 'raceGalloping'];
      sounds.forEach(sound => {
        try {
          const audio = new Audio(`/sounds/${sound}.mp3`);
          audio.volume = 0.01;
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Ignore errors, this is just to preload
              console.log(`Preloaded race sound: ${sound}`);
            });
          }
        } catch (e) {
          console.error(`Failed to preload ${sound}:`, e);
        }
      });
    }, 1000);
    
    // Clean up any animations or timers when component unmounts
    return () => {
      cleanupAnimations();
    };
  }, []);

  const initializeHorses = () => {
    const newHorses = Array.from({ length: numberOfHorses }, (_, index) => ({
      id: index + 1,
      name: horseNames[index],
      color: horseColors[index],
      position: 0,
      speed: 0,
      baseSpeed: minBaseSpeed + Math.random() * (maxBaseSpeed - minBaseSpeed),
      finished: false,
      finishTime: null,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${horseNames[index]}`
    }));
    
    setHorses(newHorses);
  };

  const cleanupAnimations = () => {
    // Cancel animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    // Clear countdown timer
    if (countdownTimerId.current) {
      clearInterval(countdownTimerId.current);
      countdownTimerId.current = null;
    }
    
    // Clear race timer
    if (raceTimerId.current) {
      clearInterval(raceTimerId.current);
      raceTimerId.current = null;
    }
    
    // Stop galloping sound if it's playing
    if (gallopingSoundRef.current) {
      clearInterval(gallopingSoundRef.current);
      gallopingSoundRef.current = null;
    }
  };

  const startRace = () => {
    // First clean up any animations
    cleanupAnimations();
    
    // Reset all race state
    setRaceNumber(prev => prev + 1); // Increment race number to ensure complete reset
    setRaceStarted(true);
    setRaceInProgress(false);
    setRaceFinished(false);
    setWinner(null);
    setElapsedTime(0);
    raceStartTime.current = null;
    
    // Reset all horses to starting positions
    setHorses(prevHorses => 
      prevHorses.map(horse => ({
        ...horse,
        position: 0,
        speed: 0,
        finished: false,
        finishTime: null,
        baseSpeed: minBaseSpeed + Math.random() * (maxBaseSpeed - minBaseSpeed) // Randomize base speed each race
      }))
    );
    
    // Reset countdown
    setCountdown(3);
    
    // Start countdown
    countdownTimerId.current = setInterval(() => {
      setCountdown(prev => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          // When countdown reaches 0, start the race
          if (countdownTimerId.current) {
            clearInterval(countdownTimerId.current);
            countdownTimerId.current = null;
          }
          
          // Play race start sound directly
          playGameSound('raceStart', 0.8);
          console.log("Playing race start sound");
          
          setTimeout(() => {
            setRaceInProgress(true);
            beginRace();
          }, 1000);
          
          return 0;
        }
        return newCount;
      });
    }, 1000);
  };

  const beginRace = () => {
    const currentRaceNumber = raceNumber; // Capture current race number for this race instance
    const startTime = Date.now();
    raceStartTime.current = startTime;
    
    // Play galloping sound directly
    playGameSound('raceGalloping', 0.1);
    console.log("Playing galloping sound");
    
    // Start a timer to update elapsed time
    raceTimerId.current = setInterval(() => {
      if (raceStartTime.current) {
        setElapsedTime(Date.now() - raceStartTime.current);
      }
    }, 100);
    
    // Fixed interval updates instead of using requestAnimationFrame
    // This provides more consistent movement
    let lastUpdateTime = Date.now();
    
    // Use a recursive timeout for more consistent frame rate
    const updateRace = () => {
      // Check if the race is still the current one
      if (!raceInProgress || currentRaceNumber !== raceNumber) {
        return; // Stop animation if race has changed or ended
      }
      
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
      lastUpdateTime = now;
      
      let allFinished = true;
      
      setHorses(prevHorses => {
        const updatedHorses = prevHorses.map(horse => {
          if (horse.finished) return horse;
          
          allFinished = false;
          
          // Calculate a consistent speed with small random variance
          const variance = (Math.random() * maxSpeedVariance * 2) - maxSpeedVariance; // Between -maxVariance and +maxVariance
          const speedFactor = 1 + variance;
          
          // Move horse based on its base speed with small variance
          const moveAmount = horse.baseSpeed * speedFactor * deltaTime * 60;
          const newPosition = horse.position + moveAmount;
          
          if (newPosition >= trackLength) {
            // Horse has finished
            return {
              ...horse,
              position: trackLength,
              finished: true,
              finishTime: Date.now() - startTime
            };
          }
          
          return {
            ...horse,
            position: newPosition
          };
        });
        
        return updatedHorses;
      });
      
      // Check if all horses have finished
      if (allFinished) {
        finishRace();
        return;
      }
      
      // Schedule next update
      animationFrameId.current = requestAnimationFrame(updateRace);
    };
    
    // Start the race animation
    animationFrameId.current = requestAnimationFrame(updateRace);
  };

  const finishRace = () => {
    // Clean up timers and animation frames
    if (raceTimerId.current) {
      clearInterval(raceTimerId.current);
      raceTimerId.current = null;
    }
    
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    // Stop galloping sound
    // Instead of removing a class, we can pause the sound
    pauseGallopingSound();
    
    // Set race state to finished
    setRaceInProgress(false);
    setRaceFinished(true);
    
    // Sort horses by finish time
    const finishedHorses = [...horses]
      .filter(horse => horse.finished)
      .sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));
    
    setRaceResults(finishedHorses);
    
    const winningHorse = finishedHorses.length > 0 ? finishedHorses[0] : null;
    setWinner(winningHorse);
    
    // Handle betting results
    if (selectedHorse && winningHorse && selectedHorse.id === winningHorse.id) {
      const payout = betAmount * 3;
      updateBalance(payout);
      setBalance(prev => prev + payout);
      toast.success(`${winningHorse.name} won! You won $${payout}!`);
    } else if (winningHorse) {
      toast.error(`${winningHorse.name} won! You lost your bet.`);
    }
  };

  // Add a new function to pause galloping sound
  const pauseGallopingSound = () => {
    pauseGameSound('raceGalloping');
    console.log("Paused galloping sound");
  };

  const resetRace = () => {
    cleanupAnimations();
    
    // Reset all state
    setRaceNumber(prev => prev + 1); // Ensure a complete reset
    setRaceStarted(false);
    setRaceInProgress(false);
    setRaceFinished(false);
    setElapsedTime(0);
    setWinner(null);
    setCountdown(3);
    setRaceResults([]);
    setSelectedHorse(null);
    
    // Reset horses
    initializeHorses();
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

  // Format time display
  const formatTime = (time: number) => {
    const seconds = (time / 1000).toFixed(2);
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900/40 to-gray-900 text-white p-4 md:p-8 rounded-xl border-2 border-green-800/50 relative overflow-hidden">
      {/* Ambient background elements */}
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
              disabled={betAmount <= 10 || raceStarted}
              className="bg-red-900/50 border-red-500/50 text-white hover:bg-red-800 rounded-full w-10 h-10"
            >
              -
            </Button>
            <span className="mx-2 text-xl font-bold text-yellow-400">{betAmount}</span>
            <Button 
              onClick={() => handleBetAmountChange(Math.min(user?.balance || 1000, betAmount + 10))}
              disabled={betAmount >= (user?.balance || 1000) || raceStarted}
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
                  onClick={() => !raceStarted && handleHorseSelect(horse)}
                  disabled={raceStarted}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-300 ${
                    selectedHorse?.id === horse.id ? 'border-green-500 bg-green-900/20' : 'border-gray-700 hover:border-white'
                  } ${raceStarted ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <img src={horse.avatar} alt={horse.name} className="w-16 h-16 rounded-full mb-2" />
                  <span className="text-lg font-semibold">{horse.name}</span>
                </button>
              </PulseAnimation>
            ))}
          </div>
        </div>

        {/* Enhanced Race Track */}
        <div className="relative overflow-hidden rounded-lg h-52 border-2 border-green-800 mb-6">
          {/* Sky background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-green-800/50"></div>
          
          {/* Sun */}
          <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-yellow-400 blur-sm opacity-60"></div>
          
          {/* Clouds */}
          <div className="absolute top-6 left-1/4 w-24 h-6 bg-white rounded-full opacity-30 blur-sm"></div>
          <div className="absolute top-10 left-1/3 w-16 h-5 bg-white rounded-full opacity-20 blur-sm"></div>
          
          {/* Grandstand */}
          <div className="absolute top-0 left-0 w-48 h-32 flex flex-col justify-end">
            <div className="bg-gray-700 h-16 rounded-tr-lg"></div>
            <div className="flex -space-x-2 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-500 rounded-full relative -top-2"></div>
              ))}
            </div>
          </div>
          
          {/* Finish line */}
          <div className="absolute top-0 right-0 h-full w-2">
            <div className="h-full w-full flex flex-col">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-[10%] w-full bg-black"></div>
              ))}
            </div>
          </div>
          
          {/* Race track */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-amber-800/70 to-amber-700/90">
            {/* Track lanes */}
            {[...Array(numberOfHorses)].map((_, i) => (
              <div 
                key={i} 
                className="absolute h-[20%] left-0 right-0 border-b border-dashed border-amber-600/50"
                style={{ top: `${i * 20}%` }}
              ></div>
            ))}
            
            {/* Track markers */}
            {[1, 2, 3, 4].map((marker, i) => (
              <div 
                key={marker} 
                className="absolute bottom-0 h-full w-0.5 bg-amber-500/30"
                style={{ left: `${(marker * 20)}%` }}
              >
                <div className="absolute -top-6 -left-3 text-amber-400/70 text-xs">
                  {marker * 200}m
                </div>
              </div>
            ))}
            
            {/* Fence along the track */}
            <div className="absolute left-0 right-0 bottom-0 h-2 bg-brown-600 flex">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="h-4 w-1 bg-amber-900 relative -top-4 mx-6"></div>
              ))}
            </div>
          </div>
          
          {/* Trees and scenery */}
          <div className="absolute bottom-24 right-24">
            <Trees className="text-green-700 w-10 h-10" />
          </div>
          <div className="absolute bottom-24 right-48">
            <Trees className="text-green-800 w-8 h-8" />
          </div>
          
          {/* Horses on track */}
          {horses.map((horse, index) => (
            <ItemGlowEffect 
              key={horse.id}
              isActive={raceFinished && winner?.id === horse.id}
              color={horse.color}
            >
              <div
                className="absolute h-10 w-10 flex items-center justify-center transition-transform duration-100"
                style={{
                  bottom: `${index * 20 + 10}px`,
                  left: `${(horse.position / trackLength) * 100}%`,
                  transform: 'translateX(-50%)',
                  zIndex: 20
                }}
              >
                <div 
                  className="w-10 h-6 rounded-md flex items-center justify-center relative" 
                  style={{ backgroundColor: horse.color }}
                >
                  <img src={horse.avatar} alt={horse.name} className="w-6 h-6 rounded-full bg-white p-0.5" />
                </div>
              </div>
            </ItemGlowEffect>
          ))}
          
          {/* Race status overlay */}
          <div className="absolute top-0 left-0 p-2 bg-black/50 rounded-br-lg text-white text-sm">
            {raceInProgress ? (
              <div className="flex items-center">
                <span className="animate-pulse mr-2 text-green-400">●</span>
                <span>Race time: {formatTime(elapsedTime)}</span>
                <span className="ml-2 text-xs text-yellow-300 animate-pulse">🔊 Racing</span>
              </div>
            ) : countdown > 0 ? (
              <div className="font-bold text-yellow-400 text-lg">Starting in {countdown}</div>
            ) : countdown === 0 ? (
              <div className="flex items-center">
                <span className="font-bold text-green-400 text-lg">GO!</span>
                <span className="ml-2 text-xs text-yellow-300 animate-pulse">🔊 Start</span>
              </div>
            ) : raceFinished ? (
              <div className="text-green-400 font-bold flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                <span>Race complete!</span>
              </div>
            ) : (
              <div>Ready to race</div>
            )}
          </div>
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
              {raceInProgress ? "Racing in progress..." : `Race starts in ${countdown}...`}
            </div>
          )}
          {raceFinished && winner && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-green-400">
                {winner.id === selectedHorse?.id ? "You Won!" : "Race Finished!"}
              </h2>
              <p className="text-gray-300">
                {winner.id === selectedHorse?.id
                  ? `${winner.name} won! You won $${betAmount * 3}!`
                  : `${winner.name} won!`}
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
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
              Race Results:
            </h2>
            <ul>
              {raceResults.map((horse, index) => (
                <li key={horse.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center">
                    <span className={`mr-2 font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : ''}`}>
                      {index + 1}.
                    </span>
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: horse.color }}></div>
                    <img src={horse.avatar} alt={horse.name} className="w-6 h-6 rounded-full mr-2" />
                    <span>{horse.name}</span>
                  </div>
                  <span className="text-sm">
                    {horse.finishTime ? formatTime(horse.finishTime) : 'DNF'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Always visible sound debug panel */}
        <div className="mt-4 p-4 bg-black/30 border border-purple-500 rounded-lg">
          <h3 className="text-lg text-white mb-2 flex items-center">
            <Volume2 className="w-5 h-5 mr-2 text-purple-400" />
            Sound Test Panel
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => {
                // Direct sound call
                playGameSound('raceStart', 0.8);
                console.log("Test: Playing race start sound");
              }}
              className="bg-blue-600 hover:bg-blue-800 text-sm"
              size="sm"
            >
              Test Start Sound
            </Button>
            <Button 
              onClick={() => {
                // Direct sound call
                playGameSound('raceGalloping', 0.5);
                console.log("Test: Playing galloping sound");
              }}
              className="bg-green-600 hover:bg-green-800 text-sm"
              size="sm"
            >
              Test Gallop Sound
            </Button>
            <Button 
              onClick={() => {
                // Play a native browser beep as a test
                try {
                  const oscillator = new (window.AudioContext || (window as any).webkitAudioContext)().createOscillator();
                  oscillator.type = 'sine';
                  oscillator.frequency.setValueAtTime(880, 0);
                  oscillator.connect(new (window.AudioContext || (window as any).webkitAudioContext)().destination);
                  oscillator.start();
                  setTimeout(() => oscillator.stop(), 200);
                } catch (e) {
                  console.error("Could not play test beep:", e);
                }
              }}
              className="bg-red-600 hover:bg-red-800 text-sm"
              size="sm"
            >
              Test Browser Audio
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Sound files: <code>/sounds/race-start.mp3</code> and <code>/sounds/race-galloping.mp3</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHorseRacing;
