
import React, { useState, useEffect, useRef } from 'react';
import PlinkoBoard from './PlinkoBoard';
import PlinkoControls from './PlinkoControls';
import PlinkoResults from './PlinkoResults';
import gameSounds from '../../utils/gameSounds';

interface BallResult {
  id: number;
  multiplier: number;
  amount: number;
  timestamp: Date;
}

const PlinkoGame: React.FC = () => {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [results, setResults] = useState<BallResult[]>([]);
  const [activeBalls, setActiveBalls] = useState<{id: number, path: number[]}[]>([]);
  const nextBallId = useRef(1);
  const animationInProgress = useRef(false);

  const riskMultipliers = {
    low: [1.2, 1.4, 1.6, 1.8, 2.1, 2.4, 2.9, 3.5, 4.9, 8.9],
    medium: [1.5, 1.8, 2.2, 2.6, 3.5, 5.2, 9.5, 16.2, 44, 100],
    high: [2.7, 3.5, 5.2, 8.1, 15, 29, 58, 140, 400, 1000]
  };

  const dropBall = () => {
    if (animationInProgress.current) return;
    if (balance < betAmount) return;
    
    setBalance(prev => prev - betAmount);
    const ballId = nextBallId.current++;
    animationInProgress.current = true;
    
    // Generate random path through the pegs
    const path: number[] = [];
    const rows = 12;
    let currentPosition = 0;
    
    for (let i = 0; i < rows; i++) {
      // Play peg hit sound
      setTimeout(() => {
        gameSounds.plinkoPeg.play();
      }, i * 300);
      
      // Randomly decide to go left or right
      const direction = Math.random() < 0.5 ? 0 : 1;
      if (direction === 0) {
        // Go left
        path.push(currentPosition);
      } else {
        // Go right
        currentPosition += 1;
        path.push(currentPosition);
      }
    }
    
    setActiveBalls(prev => [...prev, { id: ballId, path }]);
    
    // Calculate result after ball reaches bottom
    setTimeout(() => {
      const finalPosition = path[path.length - 1];
      const multipliers = riskMultipliers[risk];
      const multiplier = multipliers[finalPosition] || 1;
      const winAmount = betAmount * multiplier;
      
      // Add to results
      const newResult: BallResult = {
        id: ballId,
        multiplier,
        amount: winAmount,
        timestamp: new Date()
      };
      
      setResults(prev => [newResult, ...prev].slice(0, 50));
      setBalance(prev => prev + winAmount);
      
      // Play win sound
      gameSounds.plinkoWin.play();
      
      // Remove ball from active balls
      setActiveBalls(prev => prev.filter(ball => ball.id !== ballId));
      animationInProgress.current = false;
    }, rows * 300 + 500);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Plinko</h2>
            <div className="text-xl text-yellow-400">Balance: ${balance.toFixed(2)}</div>
          </div>
          
          <PlinkoControls 
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            risk={risk}
            setRisk={setRisk}
            onDrop={dropBall}
            balance={balance}
          />
          
          <div className="mt-4 bg-gray-800 rounded-lg overflow-hidden">
            <PlinkoBoard activeBalls={activeBalls} risk={risk} />
          </div>
        </div>
        
        <div className="lg:w-1/4 bg-gray-800 p-4 rounded-lg">
          <PlinkoResults results={results} />
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
