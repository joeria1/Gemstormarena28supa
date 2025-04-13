
import React, { useState, useEffect, useContext } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Trophy, DollarSign, User, Clock } from 'lucide-react';
import HorseIcon from '../components/HorseRacing/HorseIcon';

const horses = [
  { id: 1, name: "Thunder Bolt", odds: 5, color: "bg-amber-700" },
  { id: 2, name: "Silver Streak", odds: 5, color: "bg-slate-400" },
  { id: 3, name: "Lucky Star", odds: 5, color: "bg-yellow-500" },
  { id: 4, name: "Night Fury", odds: 5, color: "bg-gray-800" },
  { id: 5, name: "Golden Flash", odds: 5, color: "bg-yellow-600" }
];

const HorseRacing = () => {
  const { user, updateUser, addBet } = useUser();
  const [betAmount, setBetAmount] = useState<number>(5);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [positions, setPositions] = useState<Array<{id: number, position: number}>>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [raceCompleted, setRaceCompleted] = useState<boolean>(false);
  const [timeToNextRace, setTimeToNextRace] = useState<number>(10);
  const [isAutoRacing, setIsAutoRacing] = useState<boolean>(true);
  const [hasBet, setHasBet] = useState<boolean>(false);

  // Initialize horse positions
  useEffect(() => {
    resetPositions();
    
    // Start the auto racing cycle
    const interval = setInterval(() => {
      setTimeToNextRace(prev => {
        if (prev <= 1) {
          // Start a new race when the countdown reaches 0
          if (!isRacing) {
            startAutoRace();
          }
          return 10; // Reset to 10 seconds after race starts
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const resetPositions = () => {
    setPositions(horses.map(horse => ({ id: horse.id, position: 0 })));
    setWinner(null);
    setHasBet(false);
  }

  const handleBet = (amount: number) => {
    setBetAmount(amount);
  };

  const handleSelectHorse = (horseId: number) => {
    setSelectedHorse(horseId);
  };
  
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
    
    // Add to wagered amount and increase XP
    addBet(betAmount);
    
    setHasBet(true);
    
    toast.success(`Bet placed on ${horses.find(h => h.id === selectedHorse)?.name}`);
  };

  const startAutoRace = () => {
    if (isRacing) return;
    
    // Reset for a new race
    resetPositions();
    setRaceCompleted(false);
    setIsRacing(true);
    
    // Race simulation logic
    const raceInterval = setInterval(() => {
      setPositions(prevPositions => {
        const newPositions = [...prevPositions].map(horse => {
          // Random movement between 1-5% of track
          const randomMovement = Math.random() * 5 + 1;
          return {
            ...horse,
            position: Math.min(horse.position + randomMovement, 100)
          };
        });
        
        // Check if any horse has finished
        const finishedHorse = newPositions.find(horse => horse.position >= 100);
        
        if (finishedHorse) {
          clearInterval(raceInterval);
          setIsRacing(false);
          setRaceCompleted(true);
          setWinner(finishedHorse.id);
          
          // Handle winning logic for the user if they placed a bet
          if (selectedHorse !== null && hasBet) {
            if (finishedHorse.id === selectedHorse) {
              const winningHorse = horses.find(h => h.id === selectedHorse);
              if (winningHorse) {
                const winAmount = betAmount * winningHorse.odds;
                updateUser({ ...user, balance: user.balance + winAmount });
                toast.success(`You won $${winAmount.toFixed(2)}!`);
              }
            } else {
              toast.error("Better luck next time!");
            }
          }
        }
        
        return newPositions;
      });
    }, 100);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <HorseIcon className="w-8 h-8 text-green-500 mr-2" />
          <h1 className="text-2xl font-bold">Horse Racing</h1>
        </div>
        <div className="bg-gray-800 p-2 rounded-lg flex items-center">
          <DollarSign className="text-yellow-500 w-5 h-5 mr-1" />
          <span className="text-white font-bold">${user.balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Race Track</h2>
            
            <div className="flex items-center bg-blue-900 rounded-lg px-3 py-1">
              <Clock className="h-4 w-4 text-blue-300 mr-2" />
              <span className="text-white">
                {isRacing ? "Race in progress" : `Next race in ${timeToNextRace}s`}
              </span>
            </div>
          </div>
          
          <div className="relative bg-green-900 rounded-lg p-4 min-h-[400px]">
            {/* Track background with lanes */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {horses.map((_, index) => (
                <div key={index} className="border-b border-dashed border-green-700 h-[20%] flex items-center">
                  <div className="w-full bg-green-800 h-2 opacity-50"></div>
                </div>
              ))}
            </div>
            
            {/* Finish line */}
            <div className="absolute top-0 right-6 h-full w-2 bg-white bg-opacity-70 flex flex-col">
              <div className="h-full w-full bg-black bg-opacity-50 flex flex-col gap-1">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i} className="h-[10%] bg-white"></div>
                ))}
              </div>
            </div>
            
            {/* Horses */}
            {horses.map((horse, index) => {
              const position = positions.find(p => p.id === horse.id)?.position || 0;
              const isSelected = selectedHorse === horse.id;
              
              return (
                <div 
                  key={horse.id} 
                  className="absolute flex items-center"
                  style={{ 
                    bottom: `${index * 20 + 6}%`, 
                    left: `${position}%`, 
                    transform: 'translateX(-50%)',
                    transition: 'left 0.3s ease-in-out'
                  }}
                >
                  <div className={`w-10 h-6 ${horse.color} rounded-md flex items-center justify-center relative ${isSelected && hasBet ? 'ring-2 ring-yellow-500' : ''}`}>
                    <HorseIcon className="text-white w-4 h-4" />
                    {isSelected && hasBet && (
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                        <div className="bg-yellow-500 text-xs px-1 rounded text-black font-bold">
                          YOU
                        </div>
                      </div>
                    )}
                    {winner === horse.id && (
                      <div className="absolute -top-5 right-0 transform translate-x-full">
                        <Trophy className="text-yellow-500 w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
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
            </div>
          )}
        </div>
        
        <div>
          <Card className="bg-gray-900 border-none shadow-lg text-white">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Place Your Bet</h2>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Select Amount</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 25, 50, 100, 250, 500, 1000].map(amount => (
                    <Button
                      key={amount}
                      variant={betAmount === amount ? "default" : "outline"}
                      className={betAmount === amount ? "bg-green-600 hover:bg-green-700" : "border-gray-700 text-white"}
                      onClick={() => handleBet(amount)}
                      disabled={isRacing || hasBet}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator className="bg-gray-700 my-4" />
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Select Horse</h3>
                <div className="space-y-2">
                  {horses.map(horse => (
                    <div
                      key={horse.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        selectedHorse === horse.id 
                          ? 'bg-gray-800 border-green-500' 
                          : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => !isRacing && !hasBet && handleSelectHorse(horse.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 ${horse.color} rounded-md mr-3 flex items-center justify-center`}>
                          <HorseIcon className="text-white w-3 h-3" />
                        </div>
                        <span>{horse.name}</span>
                      </div>
                      <div className="text-yellow-500 font-bold">
                        {horse.odds}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                <p>Bet: ${betAmount}</p>
                {selectedHorse && (
                  <p>Potential win: ${(betAmount * (horses.find(h => h.id === selectedHorse)?.odds || 0)).toFixed(2)}</p>
                )}
              </div>
              
              <div className="mt-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!selectedHorse || isRacing || hasBet || user.balance < betAmount}
                  onClick={placeBet}
                >
                  Place Bet
                </Button>
              </div>
              
              {!selectedHorse && !hasBet && (
                <div className="mt-4 bg-blue-900/50 p-3 rounded text-blue-300 text-sm">
                  Select a horse to place your bet before the next race starts!
                </div>
              )}
              
              {selectedHorse && !hasBet && user.balance < betAmount && (
                <div className="mt-4 bg-red-900/50 p-3 rounded text-red-300 text-sm">
                  Insufficient balance to place this bet.
                </div>
              )}
              
              {hasBet && selectedHorse && (
                <div className="mt-4 bg-green-900/50 p-3 rounded text-green-300 text-sm flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Your bet on {horses.find(h => h.id === selectedHorse)?.name} is ready!
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HorseRacing;
