
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { motion } from 'framer-motion';
import { useToast } from "../../hooks/use-toast";
import HorseIcon from './HorseIcon';

interface Horse {
  id: number;
  name: string;
  color: string;
  odds: number;
  position: number;
  speed: number;
}

const generateHorses = (): Horse[] => {
  const colors = ['red', 'blue', 'green', 'purple', 'orange'];
  const names = [
    'Thunder Bolt', 'Speedy Hooves', 'Galloping Ghost', 
    'Midnight Runner', 'Lucky Charm', 'Victory Lap',
    'Silver Streak', 'Golden Gallop'
  ];
  
  return Array.from({ length: 5 }, (_, i) => {
    // Generate an odds value between 1.5 and 10
    const minOdds = 1.5;
    const maxOdds = 10;
    const odds = +(minOdds + Math.random() * (maxOdds - minOdds)).toFixed(2);
    
    // Horses with lower odds are slightly faster on average (but still random)
    // This creates a correlation between odds and performance
    const baseSpeed = 1 - (odds / maxOdds) * 0.5; // Maps to 0.5 - 1 range
    const randomFactor = Math.random() * 0.4 - 0.2; // -0.2 to +0.2 random adjustment
    const speed = Math.max(0.3, Math.min(1, baseSpeed + randomFactor));
    
    return {
      id: i,
      name: names[i % names.length],
      color: colors[i % colors.length],
      odds: odds,
      position: 0,
      speed: speed
    };
  });
};

const EnhancedHorseRacing = () => {
  const { toast } = useToast();
  const [horses, setHorses] = useState<Horse[]>(generateHorses());
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [gameState, setGameState] = useState<'betting' | 'racing' | 'results'>('betting');
  const [bet, setBet] = useState<number>(10);
  const [balance, setBalance] = useState<number>(1000);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [raceFinished, setRaceFinished] = useState<boolean>(false);
  const [countDown, setCountDown] = useState<number | null>(null);
  const raceInterval = useRef<number | null>(null);
  const raceLength = 100; // 100% width of track
  
  // Clear interval when component unmounts
  useEffect(() => {
    return () => {
      if (raceInterval.current) {
        window.clearInterval(raceInterval.current);
      }
    };
  }, []);
  
  // Reset the race
  const resetRace = () => {
    setHorses(generateHorses());
    setSelectedHorse(null);
    setGameState('betting');
    setWinner(null);
    setRaceFinished(false);
    setCountDown(null);
    if (raceInterval.current) {
      window.clearInterval(raceInterval.current);
      raceInterval.current = null;
    }
  };
  
  // Handle selecting a horse to bet on
  const handleSelectHorse = (horse: Horse) => {
    if (gameState !== 'betting') return;
    setSelectedHorse(horse);
  };
  
  // Start the race
  const startRace = () => {
    if (gameState !== 'betting' || !selectedHorse) return;
    
    if (bet > balance) {
      toast({
        title: "Insufficient balance",
        description: "Please lower your bet amount",
        variant: "destructive"
      });
      return;
    }
    
    // Deduct bet from balance
    setBalance(prev => prev - bet);
    
    // Start countdown
    setCountDown(3);
    
    const countdownInterval = setInterval(() => {
      setCountDown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          
          // Reset all horses to starting position
          setHorses(horses.map(h => ({ ...h, position: 0 })));
          
          // Start the race
          setGameState('racing');
          
          // Start moving horses
          raceInterval.current = window.setInterval(() => {
            setHorses(prevHorses => {
              const newHorses = prevHorses.map(horse => {
                // Random movement between 0.3 and 1.0 percent of track, adjusted by horse speed
                const movement = (Math.random() * 0.7 + 0.3) * horse.speed;
                const newPosition = horse.position + movement;
                
                // Check if any horse has finished
                if (newPosition >= raceLength && !raceFinished) {
                  setWinner(horse);
                  setRaceFinished(true);
                  
                  // If player's horse won
                  if (horse.id === selectedHorse.id) {
                    const winnings = bet * horse.odds;
                    setBalance(prev => prev + winnings);
                    toast({
                      title: "Your horse won!",
                      description: `You won $${winnings.toFixed(2)}!`,
                    });
                  } else {
                    toast({
                      title: `${horse.name} won!`,
                      description: "Better luck next time!",
                      variant: "destructive"
                    });
                  }
                  
                  // Move to results after short delay
                  setTimeout(() => {
                    setGameState('results');
                    if (raceInterval.current) {
                      window.clearInterval(raceInterval.current);
                      raceInterval.current = null;
                    }
                  }, 1500);
                }
                
                return {
                  ...horse,
                  position: Math.min(newPosition, raceLength) // Cap at 100%
                };
              });
              
              return newHorses;
            });
          }, 100);
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left panel - Race info & controls */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-1/3 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Horse Racing</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Your Balance</h3>
            <p className="text-2xl font-bold text-yellow-400">${balance.toFixed(2)}</p>
          </div>
          
          {gameState === 'betting' && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Your Bet</h3>
                <div className="flex gap-2 mb-2">
                  <Button 
                    variant="outline"
                    onClick={() => setBet(prev => Math.max(1, prev - 5))}
                    className="px-2"
                  >
                    -5
                  </Button>
                  <div className="flex items-center justify-center bg-gray-700 rounded px-4 flex-1">
                    <span className="text-xl font-bold text-yellow-400">${bet}</span>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setBet(prev => prev + 5)}
                    className="px-2"
                  >
                    +5
                  </Button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Selected Horse</h3>
                {selectedHorse ? (
                  <Card className="bg-gray-700 p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-${selectedHorse.color}-500 flex items-center justify-center`}>
                        <HorseIcon color="white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{selectedHorse.name}</p>
                        <p className="text-sm text-yellow-400">Odds: {selectedHorse.odds}x</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <p className="text-gray-400">Please select a horse</p>
                )}
              </div>
              
              <Button 
                onClick={startRace}
                disabled={!selectedHorse || bet > balance}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3"
              >
                Start Race
              </Button>
            </>
          )}
          
          {gameState === 'racing' && (
            <div className="text-center">
              {countDown !== null ? (
                <div className="text-4xl font-bold text-yellow-400 my-8">
                  {countDown}
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Race in Progress</h3>
                    <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400"
                        animate={{
                          width: ["0%", "100%", "50%", "100%"],
                          opacity: [1, 0.8, 0.9, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }}
                      />
                    </div>
                  </div>
                  
                  {selectedHorse && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">Your Horse</h3>
                      <Card className="bg-gray-700 p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-${selectedHorse.color}-500 flex items-center justify-center`}>
                            <HorseIcon color="white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{selectedHorse.name}</p>
                            <p className="text-sm text-yellow-400">Position: {Math.floor(selectedHorse.position)}%</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                  
                  {winner && (
                    <div className="mt-6 p-4 bg-green-900/20 border border-green-600 rounded-lg">
                      <h3 className="text-xl font-bold text-green-400">Race Finished!</h3>
                      <p className="text-white mt-1">{winner.name} won the race!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {gameState === 'results' && (
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Race Results</h3>
                
                {winner && (
                  <Card className="bg-gray-700 p-4 mb-4">
                    <p className="text-lg text-white mb-1">Winner: <span className="font-bold">{winner.name}</span></p>
                    <div className={`w-12 h-12 mx-auto my-3 rounded-full bg-${winner.color}-500 flex items-center justify-center`}>
                      <HorseIcon color="white" size={24} />
                    </div>
                    <p className="text-md text-yellow-400">Odds: {winner.odds}x</p>
                  </Card>
                )}
                
                {selectedHorse && winner && selectedHorse.id === winner.id ? (
                  <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-green-400">You Won!</h3>
                    <p className="text-white mt-1">Winnings: ${(bet * selectedHorse.odds).toFixed(2)}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg mb-4">
                    <h3 className="text-xl font-bold text-red-400">You Lost!</h3>
                    <p className="text-white mt-1">Better luck next time!</p>
                  </div>
                )}
                
                <Button 
                  onClick={resetRace}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 mt-2"
                >
                  New Race
                </Button>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Right panel - Race track */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full md:w-2/3 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6"
        >
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Race Track</h3>
            {gameState === 'racing' && !countDown && (
              <div className="px-3 py-1 bg-yellow-600 rounded text-sm font-medium text-white">
                Live Race
              </div>
            )}
          </div>
          
          <div className="space-y-6 mt-8">
            {horses.map((horse) => (
              <div 
                key={horse.id} 
                className={`relative ${gameState === 'betting' ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (gameState === 'betting') {
                    handleSelectHorse(horse);
                  }
                }}
              >
                <div className={`flex items-center gap-2 mb-2 ${selectedHorse?.id === horse.id ? 'bg-gray-700/50 p-2 rounded-lg' : ''}`}>
                  <div className={`w-8 h-8 rounded-full bg-${horse.color}-500 flex items-center justify-center`}>
                    <HorseIcon color="white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{horse.name}</p>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-400">Odds: <span className="text-yellow-400">{horse.odds}x</span></p>
                    </div>
                  </div>
                </div>
                
                {/* Race track */}
                <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
                  {/* Progress */}
                  <motion.div 
                    className={`absolute top-0 left-0 h-full bg-${horse.color}-500`}
                    style={{ width: `${horse.position}%` }}
                  />
                  
                  {/* Horse indicator */}
                  {horse.position > 0 && (
                    <motion.div 
                      className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-${horse.color}-300 border-2 border-white`}
                      style={{ left: `calc(${horse.position}% - 8px)` }}
                    />
                  )}
                  
                  {/* Finish line */}
                  <div className="absolute top-0 right-0 h-full w-1 bg-white" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedHorseRacing;
