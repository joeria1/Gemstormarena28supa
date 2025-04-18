import React, { useState, useEffect, useRef } from 'react';
import PlinkoBoard from './PlinkoBoard';
import PlinkoControls from './PlinkoControls';
import PlinkoResults from './PlinkoResults';
import { useSound } from '../ui/sound-context';
import { playGameSound } from '../../utils/gameSounds';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import { toast } from 'sonner';

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
  const [activeBalls, setActiveBalls] = useState<{
    id: number, 
    x: number, 
    y: number, 
    vx: number, 
    vy: number, 
    currentRow: number, 
    inPocket: boolean, 
    pocketIndex?: number, 
    lastHitPeg?: {row: number, col: number}, 
    stuckTime?: number,
    scale?: number,
    growing?: boolean
  }[]>([]);
  const nextBallId = useRef(1);
  const { volume, isMuted } = useSound();
  const { playSound } = useSoundEffect();
  const physicsInterval = useRef<number | null>(null);
  const ballsInPlay = useRef<number>(0);
  const [riskLockEnabled, setRiskLockEnabled] = useState(false);
  const [lastHitMultiplier, setLastHitMultiplier] = useState<number | null>(null);
  const gameState = {
    isRunning: true,
    isPaused: false
  };

  // Set up row counts by risk level
  const rowsByRisk = {
    low: 8,     // Fewer rows for low risk
    medium: 12, // Medium number of rows
    high: 16    // More rows for high risk
  };

  // Set up pockets/goals by risk level
  const pocketCountsByRisk = {
    low: 8,     // 8 goals for low risk
    medium: 12, // 12 goals for medium risk
    high: 16    // 16 goals for high risk
  };

  const generateMultipliers = (risk: 'low' | 'medium' | 'high', count: number): number[] => {
    // Multiplier ranges to ensure house edge
    const baseValues = {
      low: { min: 0.3, mid: 0.9, max: 9 },
      medium: { min: 0.2, mid: 0.8, max: 50 },
      high: { min: 0.1, mid: 0.3, max: 1000 }
    };
    
    const { min, mid, max } = baseValues[risk];
    const result: number[] = [];
    
    for (let i = 0; i < count; i++) {
      // Calculate position relative to center (0 = middle, 1 = edge)
      const positionFactor = Math.abs((i - (count - 1) / 2) / ((count - 1) / 2));
      
      let value;
      if (risk === 'high') {
        // For high risk, make it extremely rare to hit high multipliers
        if (positionFactor > 0.96) {
          // Extreme edges (2 positions) get the max values (very rare)
          value = max;
        } else if (positionFactor > 0.9) {
          // Near edges get high values but not max (rare)
          value = max / 8; // ~125x range
        } else if (positionFactor > 0.8) {
          // Medium-far positions
          value = max / 40; // ~25x range
        } else if (positionFactor > 0.6) {
          // Medium positions
          value = max / 100; // ~10x range
        } else if (positionFactor > 0.4) {
          // Mid-center positions
          value = max / 250; // ~4x range
        } else if (positionFactor > 0.2) {
          // Near center
          value = max / 1000; // ~1x range
        } else {
          // Center positions (more common landing spots)
          value = min; // Lowest multiplier
        }
      } else if (risk === 'medium') {
        if (positionFactor > 0.9) {
          value = max; // 50x
        } else if (positionFactor > 0.75) {
          value = max / 5; // 10x
        } else if (positionFactor > 0.5) {
          value = 2;
        } else if (positionFactor > 0.25) {
          value = 0.8;
        } else {
          value = min; // 0.2x
        }
      } else {
        // Low risk
        if (positionFactor > 0.85) {
          value = max; // 9x
        } else if (positionFactor > 0.6) {
          value = 4;
        } else if (positionFactor > 0.4) {
          value = 2;
        } else if (positionFactor > 0.2) {
          value = 0.8;
        } else {
          value = min; // 0.3x
        }
      }
      
      // Round to 1 decimal place for cleaner display
      const roundedValue = Math.round(value * 10) / 10;
      result.push(roundedValue);
    }
    
    return result;
  };

  const getMultipliersForRisk = (risk: 'low' | 'medium' | 'high'): number[] => {
    const count = pocketCountsByRisk[risk];
    return generateMultipliers(risk, count);
  };

  const riskMultipliers = {
    low: getMultipliersForRisk('low'),
    medium: getMultipliersForRisk('medium'),
    high: getMultipliersForRisk('high')
  };

  useEffect(() => {
    // We no longer need this separate interval, as we have integrated the physics
    // inside the game state useEffect
    return () => {
      // Clean up function
    };
  }, []);

  useEffect(() => {
    const hasBalls = activeBalls.some(ball => !ball.inPocket);
    setRiskLockEnabled(hasBalls);
  }, [activeBalls]);

  // Ball sizes by risk level - keep the same
  const BALL_RADIUS_BY_RISK = {
    low: 12,     // Same on easy
    medium: 9,   // Same on medium
    high: 6      // Same on high
  };

  // Constants for ball physics - same across all risk levels
  const GRAVITY = 0.5;  // Fast gravity
  const BOUNCE_FACTOR = 0.65;  // Same bounce factor on all levels
  const FRICTION = 0.98;  // Same friction on all levels
  const MIN_VELOCITY = 0.2;  // Same minimum velocity
  const PEG_RADIUS = {
    low: 10,      // Standard size for low risk
    medium: 8,    // Smaller pegs for medium risk
    high: 6       // Even smaller pegs for high risk
  };

  // Revert back to original board dimensions
  const BOARD_WIDTH = 800;
  const BOARD_HEIGHT = 1000;
  const STUCK_DETECTION_TIME = 250;
  const STUCK_VELOCITY_THRESHOLD = 0.3;
  const INITIAL_VELOCITY_RANGE = 0.2;

  const getPegPositions = () => {
    const positions = [];
    const PEG_ROWS = rowsByRisk[risk];
    
    // Position pegs in triangle pattern, completely removing the first row
    for (let row = 1; row < PEG_ROWS; row++) {
      // Skip the first row entirely (index 0)
      const pegsInRow = row + 1;
      const rowWidth = (pegsInRow - 1) * 80;
      const startX = (BOARD_WIDTH - rowWidth) / 2;
      
      const rowHeight = BOARD_HEIGHT / (PEG_ROWS + 2);
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = startX + col * 80;
        const y = 80 + row * rowHeight;
        
        positions.push({ row, col, x, y });
      }
    }
    
    return positions;
  };

  const getPocketPositions = () => {
    const multipliers = riskMultipliers[risk];
    const pocketCount = multipliers.length;
    const pocketWidth = BOARD_WIDTH / pocketCount;
    
    return multipliers.map((_, index) => {
      return {
        left: index * pocketWidth,
        right: (index + 1) * pocketWidth,
        y: BOARD_HEIGHT - 30,
        index
      };
    });
  };

  // Handle ball physics
  useEffect(() => {
    if (!gameState.isRunning || gameState.isPaused) return;

    const updateInterval = setInterval(() => {
      setActiveBalls(prevBalls => {
        const newBalls = [...prevBalls];
        
        for (let i = 0; i < newBalls.length; i++) {
          const ball = newBalls[i];
          
          // Skip balls already in pockets
          if (ball.inPocket) continue;
          
          // Get ball radius based on risk level
          const ballRadius = BALL_RADIUS_BY_RISK[risk];
          // Get peg radius based on risk level
          const pegRadius = PEG_RADIUS[risk];
          
          // Apply stronger gravity
          ball.vy += GRAVITY;
          
          // Apply stronger middle-biasing force
          const distanceFromCenter = ball.x - BOARD_WIDTH / 2;
          // Apply central force - stronger now to keep balls more centered
          ball.vx -= distanceFromCenter * 0.0003;
          
          // Apply friction
          ball.vx *= FRICTION;
          ball.vy *= 0.997; // Less air resistance for faster falling
          
          // Store previous position for collision detection
          const prevX = ball.x;
          const prevY = ball.y;
          
          // Update position with smaller steps to prevent tunneling
          const steps = 3; // Fewer steps for speed
          const stepVx = ball.vx / steps;
          const stepVy = ball.vy / steps;
          
          let finalX = ball.x;
          let finalY = ball.y;
          let collisionOccurred = false;
          
          // Get peg positions for collision detection
          const pegPositions = getPegPositions();
          
          // Process movement in smaller steps to catch all collisions
          for (let step = 0; step < steps && !collisionOccurred; step++) {
            const testX = ball.x + stepVx;
            const testY = ball.y + stepVy;
            
            // Check for collisions at this step
            for (const peg of pegPositions) {
              const pegX = peg.x;
              const pegY = peg.y;
              
              const dx = testX - pegX;
              const dy = testY - pegY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < ballRadius + pegRadius) {
                // Collision detected!
                collisionOccurred = true;
                
                // Record last hit peg for animations
                ball.lastHitPeg = { row: peg.row, col: peg.col };
                
                // Calculate collision response
                const angle = Math.atan2(dy, dx);
                
                // Move ball completely outside the peg with strong repulsion
                const overlapDist = (ballRadius + pegRadius) - distance;
                finalX = testX + overlapDist * Math.cos(angle) * 1.5;
                finalY = testY + overlapDist * Math.sin(angle) * 1.5;
                
                // Reflect velocity with proper physics
                const normalX = dx / distance;
                const normalY = dy / distance;
                
                const dotProduct = ball.vx * normalX + ball.vy * normalY;
                
                // Apply bounce with center bias
                const centerBias = (BOARD_WIDTH / 2 - finalX) * 0.0005;
                ball.vx = ball.vx - 2 * dotProduct * normalX * BOUNCE_FACTOR + centerBias;
                ball.vy = ball.vy - 2 * dotProduct * normalY * BOUNCE_FACTOR;
                
                // Add randomness (but less than before)
                ball.vx += (Math.random() - 0.5) * 0.4;
                
                // Note: Sound is now handled in the PlinkoBoard component
                
                break; // Exit the loop after handling collision
              }
            }
            
            if (!collisionOccurred) {
              // No collision, accept this position
              finalX = testX;
              finalY = testY;
            } else {
              // Collision happened, stop stepping
              break;
            }
          }
          
          // Apply final position
          ball.x = finalX;
          ball.y = finalY;
          
          // Ensure balls move out of stuck positions with stronger anti-stuck measures
          if (Math.abs(ball.vx) < MIN_VELOCITY && Math.abs(ball.vy) < MIN_VELOCITY * 2) {
            // If ball is moving too slowly, give it a stronger push
      if (!ball.stuckTime) {
              ball.stuckTime = Date.now();
            } else if (Date.now() - ball.stuckTime > 100) { // Faster detection
              // After being stuck, apply a much stronger force downward with central bias
              ball.vy += 4.0; // Stronger downward push
              // Add horizontal force biased toward center
              ball.vx += (BOARD_WIDTH / 2 - ball.x) * 0.02;
              ball.stuckTime = undefined;
      }
    } else {
            ball.stuckTime = undefined;
          }
          
          // Prevent balls from going off the left or right sides
          if (ball.x < ballRadius) {
            ball.x = ballRadius;
            ball.vx = -ball.vx * 0.5 + 0.5; // Add inward force
          } else if (ball.x > BOARD_WIDTH - ballRadius) {
            ball.x = BOARD_WIDTH - ballRadius;
            ball.vx = -ball.vx * 0.5 - 0.5; // Add inward force
          }
          
          // Check if ball has reached the bottom or is about to reach the bottom
          // Using a smaller detection margin so the ball is more visibly in the pocket
          if (ball.y > BOARD_HEIGHT - 20 && !ball.inPocket) {
            const pocketWidth = BOARD_WIDTH / pocketCountsByRisk[risk];
            const pocketIndex = Math.min(
              pocketCountsByRisk[risk] - 1,
              Math.max(0, Math.floor(ball.x / pocketWidth))
            );
            
            // Ball has fallen into a pocket - make sure it disappears immediately
            ball.inPocket = true;
            ball.pocketIndex = pocketIndex;
            
            // Update the multiplier based on which pocket the ball fell into
            const multiplier = riskMultipliers[risk][pocketIndex];
            setLastHitMultiplier(multiplier);
            
            // Calculate winnings and update balance
            const winnings = betAmount * multiplier;
            handleBallInPocket(ball.id, pocketIndex);
            
            // Play win sound
            playSound('plinkoWin');
            
            // Add to game history
            const timestamp = new Date().toISOString();
            setResults(prev => [
              ...prev,
              {
                id: nextBallId.current,
                timestamp: new Date(),
                amount: betAmount,
                outcome: winnings,
                multiplier
              }
            ].slice(0, 50));
            
            // Let the ball continue to animate visually into the goal
            // before removing it after a longer delay
            setTimeout(() => {
              setActiveBalls(prevBalls => prevBalls.filter(b => b.id !== ball.id));
            }, 800);
            
            // Keep the ball in the active balls array for visual purposes
            // but mark it as in a pocket so it won't trigger this again
          }
        }
        
        return newBalls;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(updateInterval);
  }, [risk, betAmount, playSound, gameState.isRunning, gameState.isPaused]);

  const handleBallInPocket = (ballId: number, pocketIndex: number) => {
    const multipliers = riskMultipliers[risk];
    const multiplier = multipliers[pocketIndex] || 1; 
    const winAmount = betAmount * multiplier;
    
    // Play sounds
      if (!isMuted) {
        playGameSound('plinkoWin', volume * 0.8);
        
        if (multiplier >= 10) {
          setTimeout(() => playGameSound('win', volume * 0.7), 200);
          setTimeout(() => playGameSound('win', volume * 0.9), 500);
        } else if (multiplier >= 3) {
          setTimeout(() => playGameSound('win', volume * 0.8), 300);
        }
      }
      
    // Create result and update balance
      const newResult: BallResult = {
        id: ballId,
        multiplier,
        amount: winAmount,
        timestamp: new Date()
      };
      
      setResults(prev => [newResult, ...prev].slice(0, 50));
      setBalance(prev => prev + winAmount);
      
    // Show small toast for significant wins
      if (multiplier >= 10) {
      toast.success(`${multiplier}x - $${winAmount.toFixed(2)}!`, {
          position: 'top-center',
          duration: 2000,
        });
      }
      
      ballsInPlay.current--;
  };

  const dropBall = () => {
    if (balance < betAmount) return;
    
    setBalance(prev => prev - betAmount);
    const ballId = nextBallId.current++;
    ballsInPlay.current++;
    
    if (!isMuted) {
      playGameSound('caseSelect', volume * 0.3);
    }
    
    // More centered drop position
    const ballRadius = BALL_RADIUS_BY_RISK[risk];
    // Less variance to keep balls more in center
    const dropPosition = BOARD_WIDTH / 2 + (Math.random() * 20 - 10);
    
    // Faster initial velocity
    const initialVx = (Math.random() * 0.2 - 0.1); // Less horizontal, more centered
    const initialVy = 0.5; // Much faster initial drop
    
    const newBall = {
      id: ballId,
      x: dropPosition,
      y: 20, // Start higher
      vx: initialVx,
      vy: initialVy,
      currentRow: 0,
      inPocket: false,
      scale: 1, // Start at full size
      growing: false
    };
    
    setActiveBalls(prev => [...prev, newBall]);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Plinko</h2>
        <div className="text-xl text-yellow-400">Balance: ${balance.toFixed(2)}</div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 h-[75vh]">
        <div className="lg:w-1/4 flex flex-col h-full">
          {/* Controls section - left side */}
          <div className="mb-4">
          <PlinkoControls 
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            risk={risk}
            setRisk={setRisk}
            onDrop={dropBall}
            balance={balance}
            riskLocked={riskLockEnabled}
          />
          </div>
          
          {/* Results section moved to left side below controls */}
          <div className="flex-grow overflow-hidden bg-gray-800 p-4 rounded-lg">
            <PlinkoResults results={results} />
          </div>
        </div>
        
        <div className="lg:w-3/4 h-full">
          {/* Game board - right side with last hit multiplier display */}
          <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex items-center justify-center relative">
            <PlinkoBoard 
              activeBalls={activeBalls} 
              risk={risk} 
              lastHitMultiplier={lastHitMultiplier}
              ballRadius={BALL_RADIUS_BY_RISK[risk]}
              boardWidth={BOARD_WIDTH}
              boardHeight={BOARD_HEIGHT}
            />
            
            {/* Last hit multiplier display */}
            {lastHitMultiplier !== null && (
              <div className="absolute right-4 top-1/3 bg-gray-700 px-3 py-2 rounded-lg flex flex-col items-center justify-center">
                <div className="text-white text-sm mb-1">Last Hit</div>
                <div className={`text-2xl font-bold ${
                  lastHitMultiplier >= 10 ? 'text-yellow-400' :
                  lastHitMultiplier >= 5 ? 'text-green-400' :
                  lastHitMultiplier >= 1 ? 'text-blue-400' :
                  'text-orange-400'
                }`}>
                  {lastHitMultiplier}x
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
