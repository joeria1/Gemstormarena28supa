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

  const generateMultipliers = (risk: 'low' | 'medium' | 'high', count: number = 10): number[] => {
    const baseValues = {
      low: { min: 0.5, mid: 0.9, max: 9 },
      medium: { min: 0.3, mid: 0.8, max: 100 },
      high: { min: 0.1, mid: 0.5, max: 1000 }
    };
    
    const { min, mid, max } = baseValues[risk];
    const result: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const positionFactor = Math.abs((i - (count - 1) / 2) / ((count - 1) / 2));
      
      let value;
      if (positionFactor < 0.3) {
        value = min + (mid - min) * (positionFactor / 0.3);
      } else {
        const expFactor = (positionFactor - 0.3) / 0.7;
        value = mid + (max - mid) * Math.pow(expFactor, 2.5);
      }
      
      result.push(Math.round(value * 10) / 10);
    }
    
    return result;
  };

  const riskMultipliers = {
    low: generateMultipliers('low'),
    medium: generateMultipliers('medium'),
    high: generateMultipliers('high')
  };

  useEffect(() => {
    if (physicsInterval.current === null) {
      physicsInterval.current = window.setInterval(() => {
        updatePhysics();
      }, 16);
    }
    
    return () => {
      if (physicsInterval.current !== null) {
        window.clearInterval(physicsInterval.current);
        physicsInterval.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const hasBalls = activeBalls.some(ball => !ball.inPocket);
    setRiskLockEnabled(hasBalls);
  }, [activeBalls]);

  const GRAVITY = 0.32;
  const BOUNCE_FACTOR = 0.55;
  const FRICTION = 0.97;
  const MAX_VELOCITY = 14;
  const PEG_RADIUS = 15;
  const BALL_RADIUS = 14;
  const BOARD_WIDTH = 1000;
  const BOARD_HEIGHT = 1400;
  const PEG_ROWS = 12;
  const INITIAL_VELOCITY_RANGE = 0.6;
  const STUCK_DETECTION_TIME = 400;
  const STUCK_VELOCITY_THRESHOLD = 0.6;
  const PEG_REPULSION_STRENGTH = 0.15;

  const getPegPositions = () => {
    const positions = [];
    
    for (let row = 0; row < PEG_ROWS; row++) {
      const pegsInRow = row + 1;
      const rowWidth = (pegsInRow - 1) * 100;
      const startX = (BOARD_WIDTH - rowWidth) / 2;
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = startX + col * 100;
        const y = 100 + row * 100;
        
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

  const checkPegCollision = (ball: typeof activeBalls[0], pegPositions: ReturnType<typeof getPegPositions>) => {
    let closestCollision = null;
    let closestDistance = Infinity;
    let hitPeg = null;
    
    for (const peg of pegPositions) {
      if (peg.row < ball.currentRow - 2) continue;
      if (Math.abs(ball.x - peg.x) > BALL_RADIUS + PEG_RADIUS + 8) continue;
      
      const dx = ball.x - peg.x;
      const dy = ball.y - peg.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < BALL_RADIUS + PEG_RADIUS && distance < closestDistance) {
        closestDistance = distance;
        hitPeg = { row: peg.row, col: peg.col };
        
        const nx = dx / distance;
        const ny = dy / distance;
        const dotProduct = ball.vx * nx + ball.vy * ny;
        
        const newVx = ball.vx - (1 + BOUNCE_FACTOR) * dotProduct * nx;
        const newVy = ball.vy - (1 + BOUNCE_FACTOR) * dotProduct * ny;
        
        const impactIntensity = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        
        const xVariance = (Math.random() - 0.5) * 0.2;
        const yVariance = Math.random() * 0.15;
        
        const newRow = peg.row >= ball.currentRow ? peg.row + 1 : ball.currentRow;
        
        closestCollision = {
          vx: newVx + xVariance,
          vy: newVy + yVariance,
          row: newRow,
          pegRow: peg.row,
          pegCol: peg.col,
          impactIntensity
        };
      }
    }
    
    if (closestCollision) {
      let extraRandomness = 1.0;
      let repulsionFactor = 0;
      
      if (ball.lastHitPeg && 
          ball.lastHitPeg.row === hitPeg?.row && 
          ball.lastHitPeg.col === hitPeg?.col) {
        extraRandomness = 1.1 + Math.random() * 0.2;
        repulsionFactor = PEG_REPULSION_STRENGTH;
        
        if (Math.abs(closestCollision.vx) + Math.abs(closestCollision.vy) < STUCK_VELOCITY_THRESHOLD * 2) {
          closestCollision.vy = Math.max(closestCollision.vy, GRAVITY * 5);
          closestCollision.vx += (Math.random() > 0.5 ? 1 : -1) * GRAVITY * 3;
        }
      }
      
      if (!isMuted) {
        const impactSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const volume = Math.min(0.3 + (impactSpeed / MAX_VELOCITY) * 0.7, 1.0);
        playGameSound('plinkoPeg', volume * 0.5);
      }
      
      ball.currentRow = closestCollision.row;
      ball.lastHitPeg = hitPeg;
      
      const dx = ball.x - (hitPeg ? pegPositions.find(p => p.row === hitPeg.row && p.col === hitPeg.col)?.x || ball.x : ball.x);
      const dy = ball.y - (hitPeg ? pegPositions.find(p => p.row === hitPeg.row && p.col === hitPeg.col)?.y || ball.y : ball.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      let repulsionVx = 0;
      let repulsionVy = 0;
      
      if (distance > 0) {
        repulsionVx = (dx / distance) * repulsionFactor * MAX_VELOCITY;
        repulsionVy = (dy / distance) * repulsionFactor * MAX_VELOCITY;
        repulsionVy = Math.max(repulsionVy, 0);
      }
      
      const vx = Math.min(Math.max((closestCollision.vx * extraRandomness) + repulsionVx, -MAX_VELOCITY), MAX_VELOCITY);
      const vy = Math.min(Math.max(closestCollision.vy + repulsionVy, -MAX_VELOCITY / 2), MAX_VELOCITY);
      
      return { vx, vy };
    }
    
    return null;
  };

  const checkPocketEntry = (ball: typeof activeBalls[0], pocketPositions: ReturnType<typeof getPocketPositions>) => {
    if (ball.y >= BOARD_HEIGHT - 100) {
      const pocket = pocketPositions.find(p => ball.x >= p.left && ball.x <= p.right);
      if (pocket && !ball.inPocket) {
        return pocket.index;
      }
    }
    return null;
  };

  const handleStuckBalls = (ball: typeof activeBalls[0]) => {
    const currentTime = Date.now();
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    
    const isMovingTooSlow = speed < STUCK_VELOCITY_THRESHOLD;
    const hasStoppedVertically = ball.vy < GRAVITY / 2;
    const isSpinningHorizontally = Math.abs(ball.vx) > Math.abs(ball.vy) * 2;
    
    if (isMovingTooSlow || hasStoppedVertically || isSpinningHorizontally) {
      if (!ball.stuckTime) {
        ball.stuckTime = currentTime;
      } else if (currentTime - ball.stuckTime > STUCK_DETECTION_TIME) {
        ball.stuckTime = 0;
        return true;
      }
    } else {
      ball.stuckTime = 0;
    }
    
    if (Math.abs(ball.vx) > Math.abs(ball.vy) * 1.5 && ball.vy < GRAVITY * 3) {
      ball.vy += GRAVITY * 0.5;
    }
    
    return false;
  };

  const updatePhysics = () => {
    setActiveBalls(prevBalls => {
      if (prevBalls.length === 0) return prevBalls;
      
      const pegPositions = getPegPositions();
      const pocketPositions = getPocketPositions();
      
      const updatedBalls = prevBalls.map(ball => {
        if (ball.inPocket) return ball;
        
        const wasUnstuck = handleStuckBalls(ball);
        
        let newVy = ball.vy + GRAVITY + (Math.random() * 0.02);
        let newVx = ball.vx * FRICTION;
        
        newVx += (Math.random() - 0.5) * 0.04;
        
        const collision = checkPegCollision(ball, pegPositions);
        if (collision) {
          newVx = collision.vx;
          newVy = collision.vy;
        }
        
        let newX = ball.x + newVx + (Math.random() - 0.5) * 0.2;
        let newY = ball.y + newVy;
        
        if (newX < BALL_RADIUS) {
          newX = BALL_RADIUS + (BALL_RADIUS - newX) * 0.3;
          newVx = -newVx * 0.7;
          newVy = Math.max(newVy, GRAVITY * 3);
          newVx += 0.3;
        } else if (newX > BOARD_WIDTH - BALL_RADIUS) {
          newX = BOARD_WIDTH - BALL_RADIUS - (newX - (BOARD_WIDTH - BALL_RADIUS)) * 0.3;
          newVx = -newVx * 0.7;
          newVy = Math.max(newVy, GRAVITY * 3);
          newVx -= 0.3;
        }
        
        const distanceFromCenter = (newX - BOARD_WIDTH / 2) / (BOARD_WIDTH / 2);
        if (Math.abs(distanceFromCenter) > 0.2) {
          newVx -= distanceFromCenter * 0.02;
        }
        
        newVx = Math.min(Math.max(newVx, -MAX_VELOCITY), MAX_VELOCITY);
        newVy = Math.min(Math.max(newVy, -MAX_VELOCITY / 1.5), MAX_VELOCITY * 1.2);
        
        const pocketIndex = checkPocketEntry(
          { ...ball, x: newX, y: newY },
          pocketPositions
        );
        
        let inPocket = ball.inPocket;
        if (pocketIndex !== null) {
          inPocket = true;
          
          handleBallInPocket(ball.id, pocketIndex);
        }
        
        return {
          ...ball,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          inPocket,
          pocketIndex: inPocket ? (pocketIndex ?? ball.pocketIndex) : undefined
        };
      });
      
      const ballsToKeep = updatedBalls.filter(ball => 
        (!ball.inPocket && ball.y < BOARD_HEIGHT + BALL_RADIUS * 2) ||
        (ball.inPocket && Date.now() - (ball as any).pocketTime < 1000)
      );
      
      ballsInPlay.current = ballsToKeep.filter(ball => !ball.inPocket).length;
      
      return ballsToKeep;
    });
  };

  const handleBallInPocket = (ballId: number, pocketIndex: number) => {
    const multipliers = riskMultipliers[risk];
    const multiplier = multipliers[pocketIndex] || 1; 
    const winAmount = betAmount * multiplier;
    
    setActiveBalls(prev => 
      prev.map(ball => 
        ball.id === ballId 
          ? { ...ball, inPocket: true, pocketIndex, pocketTime: Date.now() } 
          : ball
      )
    );
    
    setTimeout(() => {
      if (!isMuted) {
        playGameSound('plinkoWin', volume * 0.8);
        
        if (multiplier >= 10) {
          setTimeout(() => playGameSound('win', volume * 0.7), 200);
          setTimeout(() => playGameSound('win', volume * 0.9), 500);
          setTimeout(() => playGameSound('win', volume), 800);
        } else if (multiplier >= 3) {
          setTimeout(() => playGameSound('win', volume * 0.8), 300);
        }
      }
      
      const newResult: BallResult = {
        id: ballId,
        multiplier,
        amount: winAmount,
        timestamp: new Date()
      };
      
      setResults(prev => [newResult, ...prev].slice(0, 50));
      setBalance(prev => prev + winAmount);
      
      if (multiplier >= 10) {
        toast.success(`AMAZING WIN! ${multiplier}x - $${winAmount.toFixed(2)}!`, {
          position: 'top-center',
          duration: 4000,
          style: { background: '#ffd700', color: '#000' }
        });
      } else if (multiplier >= 3) {
        toast.success(`Great win! ${multiplier}x - $${winAmount.toFixed(2)}`, {
          position: 'top-center',
          duration: 3000,
        });
      } else if (multiplier >= 1) {
        toast.success(`You won ${multiplier}x - $${winAmount.toFixed(2)}`, {
          position: 'top-center',
          duration: 2000,
        });
      } else {
        toast(`Payout: ${multiplier}x - $${winAmount.toFixed(2)}`, {
          position: 'top-center',
          duration: 2000,
        });
      }
      
      ballsInPlay.current--;
    }, 100);
  };

  const dropBall = () => {
    if (balance < betAmount) return;
    
    setBalance(prev => prev - betAmount);
    const ballId = nextBallId.current++;
    ballsInPlay.current++;
    
    if (!isMuted) {
      playGameSound('caseSelect', volume * 0.3);
      setTimeout(() => {
        playGameSound('plinkoPeg', volume * 0.6);
      }, 200);
    }
    
    const centerBias = Math.random() > 0.4 ? 0.6 : 1.0;
    const dropPosition = BOARD_WIDTH / 2 + (Math.random() * 50 - 25) * centerBias;
    
    const initialVx = (Math.random() * INITIAL_VELOCITY_RANGE - INITIAL_VELOCITY_RANGE/2) * 0.8;
    const initialVy = 0.3 + Math.random() * 0.4;
    
    const newBall = {
      id: ballId,
      x: Math.max(BALL_RADIUS * 2, Math.min(BOARD_WIDTH - BALL_RADIUS * 2, dropPosition)),
      y: 25 + (Math.random() * 15),
      vx: initialVx,
      vy: initialVy,
      currentRow: 0,
      inPocket: false,
      scale: 0.2,
      growing: true
    };
    
    setActiveBalls(prev => [...prev, newBall]);
    
    const animateBallEntry = () => {
      setActiveBalls(prev => 
        prev.map(ball => 
          ball.id === ballId && ball.scale < 1
            ? { 
                ...ball, 
                scale: Math.min(ball.scale + 0.2, 1),
                growing: ball.scale < 0.8
              }
            : ball
        )
      );
      
      const currentBall = activeBalls.find(b => b.id === ballId);
      if (currentBall && currentBall.scale < 1) {
        requestAnimationFrame(animateBallEntry);
      }
    };
    
    requestAnimationFrame(animateBallEntry);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-7xl mx-auto">
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
            riskLocked={riskLockEnabled}
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
