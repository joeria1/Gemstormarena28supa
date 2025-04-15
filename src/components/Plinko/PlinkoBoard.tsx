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
  // Adjust number of rows and pocket counts based on risk level
  const getRowsAndPockets = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return { rows: 8, pockets: 10 };
      case 'medium':
        return { rows: 12, pockets: 14 };
      case 'high':
        return { rows: 16, pockets: 18 };
    }
  };

  const { rows, pockets } = getRowsAndPockets(risk);
  
  const riskColors = {
    low: 'bg-blue-500',
    medium: 'bg-purple-500',
    high: 'bg-red-500'
  };
  
  const pegColor = riskColors[risk];
  const ballColor = 'bg-yellow-400';
  const boardRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSoundEffect();
  
  // Adjust board dimensions based on risk level
  const getBoardDimensions = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return { width: 800, height: 1000 };
      case 'medium':
        return { width: 1000, height: 1400 };
      case 'high':
        return { width: 1200, height: 1800 };
    }
  };

  const { width: boardWidth, height: boardHeight } = getBoardDimensions(risk);

  // Peg collision animation refs
  const pegRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const pocketRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Set up peg positions with adjusted spacing based on risk level
  const pegPositions = [];
  const pegSpacing = risk === 'high' ? 6 : risk === 'medium' ? 7 : 8;
  
  for (let row = 0; row < rows; row++) {
    const pegsInRow = row + 1;
    for (let col = 0; col < pegsInRow; col++) {
      const pegStyle = {
        left: `${50 - (pegsInRow - 1) * (pegSpacing/2) + col * pegSpacing}%`,
        top: `${(row + 1) * (100/rows)}%`
      };
      pegPositions.push({ row, col, style: pegStyle });
    }
  }

  // Update multipliers with proper house edge and distribution
  const generateMultipliers = (risk: 'low' | 'medium' | 'high', count: number): number[] => {
    const baseValues = {
      low: { min: 0.7, mid: 1.0, max: 9 },
      medium: { min: 0.4, mid: 1.0, max: 100 },
      high: { min: 0.2, mid: 1.0, max: 1000 }
    };
    
    const { min, mid, max } = baseValues[risk];
    const result: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const positionFactor = Math.abs((i - (count - 1) / 2) / ((count - 1) / 2));
      
      let value;
      if (positionFactor < 0.2) {
        // Center positions - lowest multipliers (house edge)
        value = min + (mid - min) * (positionFactor / 0.2);
      } else {
        // Exponential increase for edge positions
        const expFactor = (positionFactor - 0.2) / 0.8;
        value = mid + (max - mid) * Math.pow(expFactor, 2.5); // Steeper curve for better distribution
      }
      
      result.push(Math.round(value * 10) / 10);
    }
    
    return result;
  };

  const multipliers = {
    low: generateMultipliers('low', 10),
    medium: generateMultipliers('medium', 14),
    high: generateMultipliers('high', 18)
  };

  // Enhanced peg collision animation
  useEffect(() => {
    const recentlyAnimatedPegs = new Set<string>();
    
    activeBalls.forEach(ball => {
      const ballRow = Math.floor((ball.y / boardHeight) * rows);
      
      if (ballRow >= 0 && ballRow < rows) {
        const pegsInRow = ballRow + 1;
        const pegSpacing = (boardWidth / (rows + 1));
        
        for (let r = Math.max(0, ballRow - 1); r <= Math.min(rows - 1, ballRow + 1); r++) {
          const pegsInThisRow = r + 1;
          const rowStartX = (boardWidth - (pegsInThisRow - 1) * pegSpacing) / 2;
          
          for (let c = 0; c < pegsInThisRow; c++) {
            const pegX = rowStartX + c * pegSpacing;
            const pegY = (r + 1) * (boardHeight / (rows + 1));
            const dx = ball.x - pegX;
            const dy = ball.y - pegY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) {
              const pegKey = `peg-${r}-${c}`;
              
              if (!recentlyAnimatedPegs.has(pegKey)) {
                const pegElement = pegRefs.current[pegKey];
                if (pegElement) {
                  pegElement.classList.add('peg-pulse');
                  
                  setTimeout(() => {
                    if (pegElement) {
                      pegElement.classList.remove('peg-pulse');
                    }
                  }, 300);
                  
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

    // Enhanced pocket animation when balls land
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
          }, 1000);
        }
      }
    });
  }, [activeBalls, rows, boardHeight]);

  const renderPegs = () => {
    return pegPositions.map(({ row, col, style }) => {
      const pegKey = `peg-${row}-${col}`;
      
      return (
        <div 
          ref={el => pegRefs.current[pegKey] = el}
          key={pegKey}
          data-row={row}
          data-col={col}
          className={`absolute w-4 h-4 rounded-full ${pegColor} transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150`} 
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
      const ballClasses = `absolute w-5 h-5 rounded-full ${ballColor} shadow-lg z-10 ${
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

  // Enhanced multiplier buckets with improved animations
  const renderMultiplierBuckets = () => {
    const currentMultipliers = multipliers[risk];
    
    return currentMultipliers.map((multiplier, index) => {
      const isActive = activeBalls.some(ball => 
        ball.inPocket && ball.pocketIndex === index
      );
      
      return (
        <div 
          key={`bucket-${index}`} 
          className="flex flex-col items-center justify-center h-16 text-white font-bold transition-all"
          style={{ width: `${100 / currentMultipliers.length}%` }}
        >
          <div 
            ref={el => pocketRefs.current[`pocket-${index}`] = el}
            className={`w-full h-4 ${riskColors[risk]} rounded-t-md transition-all transform ${
              isActive ? 'animate-bounce brightness-150 scale-y-110' : ''
            }`}
          />
          <div className={`mt-2 transition-all transform ${
            isActive ? 'text-yellow-400 scale-110 animate-pulse' : ''
          }`}>
            {multiplier}x
          </div>
        </div>
      );
    });
  };

  return (
    <div 
      className="relative w-full overflow-hidden" 
      style={{ 
        paddingTop: `${(boardHeight / boardWidth) * 100}%`,
        maxWidth: `${boardWidth}px`,
        margin: '0 auto'
      }} 
      ref={boardRef}
    >
      <div className="absolute inset-0 bg-gray-900">
        {renderPegs()}
        {renderBalls()}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {renderMultiplierBuckets()}
        </div>
      </div>
      
      <style>
        {`
        @keyframes pocket-pulse {
          0% { transform: scaleY(1); }
          25% { transform: scaleY(1.8); }
          50% { transform: scaleY(1.3); }
          75% { transform: scaleY(1.6); }
          100% { transform: scaleY(1); }
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
          animation: pocket-pulse 1s cubic-bezier(0.4, 0, 0.6, 1);
        }

        @keyframes pocket-bounce {
          0% { transform: translateY(0); }
          25% { transform: translateY(-4px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-2px); }
          100% { transform: translateY(0); }
        }

        .animate-pocket-bounce {
          animation: pocket-bounce 0.7s cubic-bezier(0.4, 0, 0.6, 1) 2;
        }

        @keyframes pocket-entry {
          0% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
          50% { opacity: 1; transform: scale(1.4) translate(-50%, -50%); }
          100% { opacity: 0; transform: scale(0.8) translate(-50%, -50%); }
        }

        @keyframes bounce {
          0% { transform: scale(1) translate(-50%, -50%); }
          50% { transform: scale(1.2) translate(-50%, -50%); }
          100% { transform: scale(1) translate(-50%, -50%); }
        }
        `}
      </style>
    </div>
  );
};

export default PlinkoBoard;
