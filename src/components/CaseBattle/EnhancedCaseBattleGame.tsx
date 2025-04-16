
import React, { useState, useEffect } from 'react';
import { User, Award, RefreshCw, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useSoundEffect from '@/hooks/useSoundEffect';
import { toast } from 'sonner';
import SpinningEffect from '../GameEffects/SpinningEffect';
import LightningEffect from '../GameEffects/LightningEffect';
import ItemGlowEffect from '../GameEffects/ItemGlowEffect';

interface Player {
  id: number;
  name: string;
  avatar: string;
  balance: number;
  team: number;
  isBot?: boolean;
}

interface Case {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CaseBattleGameProps {
  players?: Player[];
  cases?: Case[];
  mode?: string;
  onBack?: () => void;
  onRecreate?: () => void;
}

const CaseBattleGame: React.FC<CaseBattleGameProps> = ({
  players = [],
  cases = [],
  mode = '2v2',
  onBack,
  onRecreate
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'spinning' | 'results'>('waiting');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [readyPlayers, setReadyPlayers] = useState<number[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [winningTeam, setWinningTeam] = useState<number | null>(null);
  const { playSound } = useSoundEffect();
  
  const defaultPlayers: Player[] = [
    { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 0, team: 0 },
    { id: 2, name: 'BinLaden', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 0, team: 0 },
    { id: 3, name: 'P. Diddy', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 0, team: 1 },
    { id: 4, name: 'Al Qaida', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 0, team: 1 },
  ];

  const defaultCases: Case[] = [
    { id: 1, name: 'Muertos Death', price: 33.23, image: '/lovable-uploads/d10cbc3f-e87e-4657-b963-ce96a76f4d0d.png' },
  ];

  const actualPlayers = players.length > 0 ? players : defaultPlayers;
  const actualCases = cases.length > 0 ? cases : defaultCases;

  const totalValue = actualCases.reduce((sum, caseItem) => sum + caseItem.price, 0);

  const handleReadyPlayer = (playerId: number) => {
    if (readyPlayers.includes(playerId)) {
      setReadyPlayers(readyPlayers.filter(id => id !== playerId));
    } else {
      setReadyPlayers([...readyPlayers, playerId]);
      playSound('caseSelect');

      // If all players are ready, start the game
      if (readyPlayers.length + 1 === actualPlayers.filter(p => !p.isBot).length) {
        startGame();
      }
    }
  };

  const handleCallBot = (slot: number) => {
    toast.success("Bot added to the game");
    playSound('caseSelect');
    
    // Check if all slots are filled
    if (readyPlayers.length === actualPlayers.filter(p => !p.isBot).length - 1) {
      startGame();
    }
  };

  const startGame = () => {
    setGameState('spinning');
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          playSound('caseSelect');
          
          // After countdown, simulate spinning for 5 seconds
          setTimeout(() => {
            setGameState('results');
            
            // Randomly select winning team
            const winTeam = Math.random() > 0.5 ? 0 : 1;
            setWinningTeam(winTeam);
            
            // Simulate results
            const simulatedResults = actualPlayers.map(player => ({
              ...player,
              isWinner: player.team === winTeam,
              winAmount: player.team === winTeam ? Math.floor(totalValue * 0.9 / actualPlayers.filter(p => p.team === winTeam).length) : 0,
              items: player.team === winTeam ? [
                { 
                  id: 1, 
                  name: 'Catrina Día de Muertos Mask', 
                  price: 138, 
                  image: '/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png', 
                  rarity: 'rare',
                  dropChance: '5%'
                }
              ] : [
                { 
                  id: 2, 
                  name: 'Bozo', 
                  price: 10, 
                  image: '', 
                  rarity: 'common',
                  dropChance: '95%'
                }
              ]
            }));
            
            setResults(simulatedResults);
          }, 5000);
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const renderPlayerSlot = (player: Player, index: number) => {
    const isReady = readyPlayers.includes(player.id) || player.isBot;
    const isCurrentUser = player.name === 'Truster8845';

    if (gameState === 'waiting') {
      return (
        <div key={`player-${index}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 relative">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 overflow-hidden rounded-full border border-[#1a2c4c] mr-2">
              {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a2c4c] flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{player.name || '--'}</div>
              <div className="flex items-center">
                <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                <span className="text-white">0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {isCurrentUser && !isReady ? (
              <button 
                onClick={() => handleReadyPlayer(player.id)}
                className="bg-[#0f2e3b] border border-[#00d7a3] text-white rounded-md px-4 py-2 hover:bg-[#1a5a4f] transition-colors w-full"
              >
                <div className="flex items-center justify-center">
                  <span className="text-[#00d7a3] mr-2">✓</span>
                  <span>Player Ready</span>
                </div>
              </button>
            ) : isCurrentUser && isReady ? (
              <div className="bg-[#0f2e3b] border border-[#00d7a3] text-white rounded-md px-4 py-2 w-full text-center">
                <div className="flex items-center justify-center">
                  <span className="text-[#00d7a3] mr-2">✓</span>
                  <span>Player Ready</span>
                </div>
              </div>
            ) : player.name ? (
              <div className="text-center text-white">Player joined</div>
            ) : (
              <div className="flex justify-center">
                <button 
                  onClick={() => handleCallBot(index)}
                  className="bg-[#0f2e3b] border border-[#00d7a3] text-white rounded-md px-4 py-2 hover:bg-[#1a5a4f] transition-colors"
                >
                  <div className="flex items-center">
                    <span className="mr-2">🤖</span>
                    <span>Call Bot</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      );
    } else if (gameState === 'spinning') {
      return (
        <div key={`spinning-${index}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 relative">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 overflow-hidden rounded-full border border-[#1a2c4c] mr-2">
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{player.name}</div>
              <div className="flex items-center">
                <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                <span className="text-white">0</span>
              </div>
            </div>
          </div>

          <div className="min-h-[180px] flex items-center justify-center">
            <div className="relative">
              <img 
                src="/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png" 
                alt="Spinning item" 
                className={`w-16 h-16 object-contain animate-spin`} 
              />
              {index % 2 === 0 && (
                <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 text-red-500 text-3xl font-bold">👹</div>
              )}
              {index === 1 && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <SpinningEffect isSpinning={true} onComplete={() => {}}>
                    <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  </SpinningEffect>
                </div>
              )}
              {index % 2 === 1 && (
                <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 text-red-500 text-3xl font-bold">👹</div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      const result = results.find(r => r.id === player.id);
      const isWinner = result?.isWinner;
      
      return (
        <div key={`result-${index}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 relative">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 overflow-hidden rounded-full border border-[#1a2c4c] mr-2">
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{player.name}</div>
              <div className="flex items-center">
                <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                <span className="text-white">{player.name === 'P. Diddy' ? 138 : 10}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a1424] border border-[#1a2c4c] rounded-lg p-4 mb-4">
            <div className={`text-center font-bold text-xl ${isWinner ? 'text-[#00d7a3]' : 'text-red-500'}`}>
              {isWinner ? 'WINNER' : 'LOST BATTLE'}
            </div>
            {isWinner && (
              <div className="flex items-center justify-center mt-2">
                <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
                <span className="text-white font-bold">+{result?.winAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          {index === 0 && onRecreate && (
            <button 
              onClick={onRecreate}
              className="flex items-center justify-center bg-[#0f2e3b] hover:bg-[#1a5a4f] border border-[#00d7a3] text-white rounded-md px-4 py-2 w-full transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2 text-[#00d7a3]" />
              <span>Recreate Battle</span>
            </button>
          )}
          
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${isWinner ? 'bg-[#00d7a3]' : 'bg-red-500'}`}></div>
        </div>
      );
    }
  };

  const renderItemResults = () => {
    if (gameState !== 'results') return null;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        {results.flatMap(player => 
          player.items.map((item: any, itemIdx: number) => (
            <div key={`item-${player.id}-${itemIdx}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 relative">
              <div className="absolute top-3 right-3 bg-[#0f2e3b] text-[#00d7a3] px-2 py-0.5 rounded text-sm">
                {item.dropChance}
              </div>
              <div className="flex justify-center mb-2">
                <img 
                  src={item.image || '/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png'} 
                  alt={item.name} 
                  className="w-16 h-16 object-contain" 
                />
              </div>
              <div className="text-center text-white text-sm mb-1">
                {item.name}
              </div>
              <div className="flex items-center justify-center">
                <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                <span className="text-white font-bold">{item.price.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-[#0a1424] rounded-lg border border-[#1a2c4c] p-4 mb-6 relative">
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
            <div className="text-8xl font-bold text-[#00d7a3]">{countdown}</div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-300 hover:text-white transition-colors mr-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to lobby
          </button>
          
          {gameState === 'waiting' && (
            <div className="flex items-center text-xl font-bold text-white">
              Waiting For Players ({readyPlayers.length}/{actualPlayers.filter(p => !p.isBot).length})
              <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 ml-2" />
              <span className="text-white font-bold">...</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button className="bg-transparent border border-[#1a2c4c] hover:border-[#253e64] text-white rounded-md p-2 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
            <button className="bg-transparent border border-[#1a2c4c] hover:border-[#253e64] text-white rounded-md px-4 py-2 transition-colors">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>Fairness</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="bg-[#0f2e3b] text-[#00d7a3] px-4 py-1 rounded-md">{mode}</div>
            <div className="flex items-center gap-4">
              {actualCases.map((caseItem, idx) => (
                <div key={`case-preview-${idx}`} className="w-12 h-12">
                  <img 
                    src={caseItem.image} 
                    alt={caseItem.name} 
                    className={`w-full h-full object-contain ${gameState === 'spinning' ? 'animate-pulse' : ''}`} 
                  />
                </div>
              ))}
              {Array.from({ length: 9 - actualCases.length }).map((_, idx) => (
                <div key={`empty-case-preview-${idx}`} className="w-12 h-12 bg-[#0d1b32] border border-[#1a2c4c] rounded"></div>
              ))}
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Total Value</span>
              <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
              <span className="text-white font-bold">{totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actualPlayers.map((player, index) => renderPlayerSlot(player, index))}
        </div>
        
        {renderItemResults()}
      </div>
    </div>
  );
};

export default CaseBattleGame;
