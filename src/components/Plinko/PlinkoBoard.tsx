
import React, { useRef, useEffect } from 'react';
import { useSoundEffect } from '../../hooks/useSoundEffect';

interface PlinkoBoardProps {
  activeBalls: { 
    id: number; 
    x: number; 
    y: number; 
    vx: number; 
    vy: number; 
    currentRow: number;
    inPocket: boolean;
    pocketIndex?: number;
  }[];
  risk: 'low' | 'medium' | 'high';
}

const PlinkoBoard: React.FC<PlinkoBoardProps> = ({ activeBalls, risk }) => {
  const rows = 12;
  const riskColors = {
    low: 'bg-blue-500',
    medium: 'bg-purple-500',
    high: 'bg-red-500'
  };
  
  const pegColor = riskColors[risk];
  const ballColor = 'bg-yellow-400';
  const boardRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSoundEffect();
  const boardWidth = 1000; // Normalized board width to match Game component
  const boardHeight = 1400; // Normalized board height to match Game component

  // Peg collision animation refs
  const pegRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const pocketRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Set up peg positions for rendering
  const pegPositions = [];
  for (let row = 0; row < rows; row++) {
    const pegsInRow = row + 1;
    for (let col = 0; col < pegsInRow; col++) {
      const pegStyle = {
        left: `${50 - (pegsInRow - 1) * 5 + col * 10}%`,
        top: `${(row + 1) * 7}%`
      };
      pegPositions.push({ row, col, style: pegStyle });
    }
  }

  // Update multipliers to be higher on the edges and lower in the middle
  const generateMultipliers = (risk: 'low' | 'medium' | 'high', count: number = 10): number[] => {
    // Base multiplier values based on risk
    const baseValues = {
      low: { min: 1.1, mid: 1.5, max: 9 },
      medium: { min: 1.2, mid: 2, max: 100 },
      high: { min: 1.5, mid: 5, max: 1000 }
    };
    
    const { min, mid, max } = baseValues[risk];
    const result: number[] = [];
    
    // Fill in multipliers, higher on edges, lower in middle
    for (let i = 0; i < count; i++) {
      // Calculate position relative to center (0 = middle, 1 = edge)
      const positionFactor = Math.abs((i - (count - 1) / 2) / ((count - 1) / 2));
      
      // Calculate multiplier value based on position
      // Use exponential curve for more dramatic increase at edges
      let value;
      if (positionFactor < 0.3) {
        value = min + (mid - min) * (positionFactor / 0.3);
      } else {
        // Exponential increase for edge positions
        const expFactor = (positionFactor - 0.3) / 0.7;
        value = mid + (max - mid) * Math.pow(expFactor, 2);
      }
      
      // Round to 1 decimal place
      result.push(Math.round(value * 10) / 10);
    }
    
    return result;
  };

  const multipliers = {
    low: generateMultipliers('low'),
    medium: generateMultipliers('medium'),
    high: generateMultipliers('high')
  };

  // Animate peg when ball hits it
  useEffect(() => {
    // Track which pegs have been animated recently to prevent spamming animations
    const recentlyAnimatedPegs = new Set<string>();
    
    activeBalls.forEach(ball => {
      // Calculate which pegs are near this ball
      const ballRow = Math.floor(ball.y / 100) - 1; // Adjust based on board scaling
      
      if (ballRow >= 0 && ballRow < rows) {
        const pegsInRow = ballRow + 1;
        const pegSpacing = 100; // Normalized spacing
        
        // Check the pegs in this row and adjacent rows
        for (let r = Math.max(0, ballRow - 1); r <= Math.min(rows - 1, ballRow + 1); r++) {
          const pegsInThisRow = r + 1;
          const rowStartX = (boardWidth - (pegsInThisRow - 1) * pegSpacing) / 2;
          
          for (let c = 0; c < pegsInThisRow; c++) {
            const pegX = rowStartX + c * pegSpacing;
            const pegY = 100 + r * 100; // Based on peg layout
            const dx = ball.x - pegX;
            const dy = ball.y - pegY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If ball is close to peg, animate the peg
            if (distance < 30) {
              const pegKey = `peg-${r}-${c}`;
              
              if (!recentlyAnimatedPegs.has(pegKey)) {
                // Animate this peg
                const pegElement = pegRefs.current[pegKey];
                if (pegElement) {
                  // Add pulse animation class
                  pegElement.classList.add('peg-pulse');
                  
                  // Remove class after animation completes
                  setTimeout(() => {
                    if (pegElement) {
                      pegElement.classList.remove('peg-pulse');
                    }
                  }, 300);
                  
                  // Add to recently animated set to prevent spam
                  recentlyAnimatedPegs.add(pegKey);
                  setTimeout(() => {
                    recentlyAnimatedPegs.delete(pegKey);
                  }, 150);
                }
              }
            }
          }
        }
      }
    });

    // Animate pockets when balls land in them
    activeBalls.forEach(ball => {
      if (ball.inPocket && ball.pocketIndex !== undefined) {
        const pocketKey = `pocket-${ball.pocketIndex}`;
        const pocketElement = pocketRefs.current[pocketKey];
        
        if (pocketElement && !pocketElement.classList.contains('pocket-pulse')) {
          pocketElement.classList.add('pocket-pulse');
          
          setTimeout(() => {
            if (pocketElement) {
              pocketElement.classList.remove('pocket-pulse');
            }
          }, 500);
        }
      }
    });
  }, [activeBalls, rows]);

  // Generate pegs grid
  const renderPegs = () => {
    return pegPositions.map(({ row, col, style }) => {
      // Add a unique key for each peg for ball collision animation
      const pegKey = `peg-${row}-${col}`;
      
      return (
        <div 
          ref={el => pegRefs.current[pegKey] = el}
          key={pegKey}
          data-row={row}
          data-col={col}
          className={`absolute w-3 h-3 rounded-full ${pegColor} transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150`} 
          style={style}
        />
      );
    });
  };

  // Render active balls with realistic physics
  const renderBalls = () => {
    return activeBalls.map(ball => {
      // Convert the normalized positions to percentages for rendering
      const ballX = (ball.x / boardWidth) * 100;
      const ballY = (ball.y / boardHeight) * 100;
      
      // Calculate ball rotation based on horizontal velocity for added realism
      const rotation = ball.vx * 10;
      
      const ballStyle = {
        left: `${ballX}%`,
        top: `${ballY}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transition: 'transform 0.1s linear'
      };
      
      // Apply special effects for balls that have entered a pocket
      const ballClasses = `absolute w-4 h-4 rounded-full ${ballColor} shadow-lg z-10 ${
        ball.inPocket ? 'animate-pocket-entry' : ''
      }`;
      
      return (
        <div 
          key={`ball-${ball.id}`} 
          className={ballClasses}
          style={ballStyle}
        />
      );
    });
  };

  // Render multiplier buckets at the bottom
  const renderMultiplierBuckets = () => {
    const currentMultipliers = multipliers[risk];
    
    return currentMultipliers.map((multiplier, index) => {
      // Highlight the bucket if any ball is in it
      const isActive = activeBalls.some(ball => 
        ball.inPocket && ball.pocketIndex === index
      );
      
      return (
        <div 
          key={`bucket-${index}`} 
          className={`flex flex-col items-center justify-center h-16 text-white font-bold transition-all ${
            isActive ? 'scale-y-110' : ''
          }`}
          style={{ width: `${100 / currentMultipliers.length}%` }}
        >
          <div 
            ref={el => pocketRefs.current[`pocket-${index}`] = el}
            className={`w-full h-2 ${riskColors[risk]} ${isActive ? 'h-3' : ''}`}
          ></div>
          <div className={`mt-2 ${isActive ? 'text-yellow-400' : ''}`}>{multiplier}x</div>
        </div>
      );
    });
  };

  return (
    <div className="relative w-full" style={{ paddingTop: '100%' }} ref={boardRef}>
      <div className="absolute inset-0 bg-gray-900 overflow-hidden">
        {/* Pegs */}
        {renderPegs()}
        
        {/* Balls */}
        {renderBalls()}
        
        {/* Multiplier buckets at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {renderMultiplierBuckets()}
        </div>
      </div>
      
      <style>
        {`
        @keyframes bounce {
          0% { transform: scale(1) translate(-50%, -50%); }
          50% { transform: scale(1.2) translate(-50%, -50%); }
          100% { transform: scale(1) translate(-50%, -50%); }
        }
        
        @keyframes pocket-entry {
          0% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
          50% { opacity: 1; transform: scale(1.4) translate(-50%, -50%); }
          100% { opacity: 0; transform: scale(0.8) translate(-50%, -50%); }
        }
        
        .peg-pulse {
          animation: pulse 0.3s cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        @keyframes pulse {
          0% { transform: scale(1) translate(-50%, -50%); }
          50% { transform: scale(2) translate(-50%, -50%); }
          100% { transform: scale(1) translate(-50%, -50%); }
        }
        
        .pocket-pulse {
          animation: pocket-pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        @keyframes pocket-pulse {
          0% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
          100% { transform: scaleY(1); }
        }
        `}
      </style>
    </div>
  );
};

export default PlinkoBoard;
