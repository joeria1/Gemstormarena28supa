
import React, { useState, useEffect } from 'react';
import { User, Award, RefreshCw, ChevronLeft, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useSoundEffect from '@/hooks/useSoundEffect';
import { toast } from 'sonner';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';

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
  const [sliderSpinning, setSliderSpinning] = useState(false);
  const [playerItems, setPlayerItems] = useState<Record<number, SliderItem[]>>({});
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [processingMultipleCases, setProcessingMultipleCases] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'1v1' | '1v1v1' | '1v1v1v1' | '2v2'>(mode as any || '2v2');
  
  const defaultPlayers: Player[] = [
    { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 0, team: 0 },
    { id: 2, name: 'BinLaden', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 0, team: 0 },
    { id: 3, name: 'P. Diddy', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 0, team: 1 },
    { id: 4, name: 'Al Qaida', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 0, team: 1 },
  ];

  const defaultCases: Case[] = [
    { id: 1, name: 'Muertos Death', price: 33.23, image: '/lovable-uploads/d10cbc3f-e87e-4657-b963-ce96a76f4d0d.png' },
    { id: 2, name: 'Eggtastic Bomb', price: 66.15, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  ];

  const getPlayerSlotsForMode = () => {
    let playerCount = 0;
    switch(selectedMode) {
      case '1v1':
        playerCount = 2;
        break;
      case '1v1v1':
        playerCount = 3;
        break;
      case '1v1v1v1':
        playerCount = 4;
        break;
      case '2v2':
        playerCount = 4;
        break;
      default:
        playerCount = 4;
    }
    
    const modePlayers = [];
    const basePlayers = players.length > 0 ? players : defaultPlayers;
    
    for (let i = 0; i < playerCount; i++) {
      if (basePlayers[i]) {
        const team = selectedMode === '2v2' ? (i < 2 ? 0 : 1) : i;
        modePlayers.push({
          ...basePlayers[i],
          team
        });
      } else {
        modePlayers.push({
          id: i + 100,
          name: '',
          avatar: '',
          balance: 0,
          team: selectedMode === '2v2' ? (i < 2 ? 0 : 1) : i
        });
      }
    }
    
    return modePlayers;
  };

  const actualPlayers = getPlayerSlotsForMode();
  const actualCases = cases.length > 0 ? cases : defaultCases;

  const totalValue = actualCases.reduce((sum, caseItem) => sum + caseItem.price, 0);
  
  const sliderItems: SliderItem[] = [
    { id: '1', name: 'Catrina Mask', image: '/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png', rarity: 'rare', price: 138 },
    { id: '2', name: 'Common Item', image: '/placeholder.svg', rarity: 'common', price: 25 },
    { id: '3', name: 'Uncommon Item', image: '/placeholder.svg', rarity: 'uncommon', price: 75 },
    { id: '4', name: 'Rare Item', image: '/placeholder.svg', rarity: 'rare', price: 150 },
    { id: '5', name: 'Epic Item', image: '/placeholder.svg', rarity: 'epic', price: 350 }
  ];

  const handleReadyPlayer = (playerId: number) => {
    if (readyPlayers.includes(playerId)) {
      setReadyPlayers(readyPlayers.filter(id => id !== playerId));
    } else {
      setReadyPlayers([...readyPlayers, playerId]);
      playSound('caseSelect');

      if (readyPlayers.length + 1 === actualPlayers.filter(p => p.name !== '').length) {
        startGame();
      }
    }
  };

  const handleCallBot = (slot: number) => {
    toast.success("Bot added to the game");
    playSound('caseSelect');
    
    if (readyPlayers.length === actualPlayers.filter(p => p.name !== '').length - 1) {
      startGame();
    }
  };

  const startGame = () => {
    setGameState('spinning');
    setCountdown(3);
    
    setCurrentCaseIndex(0);
    setPlayerItems({});
    setSliderSpinning(false);
    
    playSound('raceStart');
  };
  
  const startSpinningProcess = () => {
    if (countdown === null && !sliderSpinning) {
      setSliderSpinning(true);
      setProcessingMultipleCases(actualCases.length > 1);
      playSound('caseSelect');
      
      setTimeout(() => {
        setSliderSpinning(false);
        
        processCurrentCaseResults();
        
        if (currentCaseIndex < actualCases.length - 1) {
          setCurrentCaseIndex(prev => prev + 1);
          setTimeout(() => {
            setCountdown(3);
          }, 2000);
        } else {
          finishBattle();
        }
      }, 5000);
    }
  };

  const processCurrentCaseResults = () => {
    const currentCase = actualCases[currentCaseIndex];
    const caseValue = currentCase.price;
    
    const updatedPlayerItems = { ...playerItems };
    
    if (winningTeam === null) {
      const winTeam = Math.random() > 0.5 ? 0 : 1;
      setWinningTeam(winTeam);
    }
    
    actualPlayers.forEach(player => {
      if (!updatedPlayerItems[player.id]) {
        updatedPlayerItems[player.id] = [];
      }
      
      const isWinner = player.team === winningTeam;
      let rarity = 'common';
      
      if (isWinner) {
        const rarityRoll = Math.random();
        if (rarityRoll > 0.9) rarity = 'legendary';
        else if (rarityRoll > 0.7) rarity = 'epic';
        else if (rarityRoll > 0.4) rarity = 'rare';
        else rarity = 'uncommon';
      } else {
        rarity = Math.random() > 0.7 ? 'uncommon' : 'common';
      }
      
      let itemValue = 0;
      switch (rarity) {
        case 'legendary': itemValue = caseValue * (2 + Math.random() * 2); break;
        case 'epic': itemValue = caseValue * (1.5 + Math.random()); break;
        case 'rare': itemValue = caseValue * (0.8 + Math.random() * 0.7); break;
        case 'uncommon': itemValue = caseValue * (0.4 + Math.random() * 0.4); break;
        default: itemValue = caseValue * (0.1 + Math.random() * 0.3); break;
      }
      
      let itemImage = currentCase.image;
      
      const newItem: SliderItem = {
        id: `${player.id}-case-${currentCaseIndex}-${Date.now()}`,
        name: `${currentCase.name} ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`,
        image: itemImage,
        rarity: rarity,
        price: Math.round(itemValue * 100) / 100,
        playerId: String(player.id),
        playerName: player.name,
        playerTeam: player.team
      };
      
      updatedPlayerItems[player.id].push(newItem);
    });
    
    setPlayerItems(updatedPlayerItems);
    
    playSound('cardHit');
  };

  const finishBattle = () => {
    setTimeout(() => {
      const playerTotals: Record<number, number> = {};
      const teamTotals: Record<number, number> = { 0: 0, 1: 0 };
      
      actualPlayers.forEach(player => {
        const playerItemsList = playerItems[player.id] || [];
        const playerTotal = playerItemsList.reduce((sum, item) => sum + item.price, 0);
        
        playerTotals[player.id] = playerTotal;
        teamTotals[player.team] += playerTotal;
      });
      
      const finalWinningTeam = teamTotals[0] > teamTotals[1] ? 0 : 1;
      setWinningTeam(finalWinningTeam);
      
      playSound('plinkoWin');
      
      const simulatedResults = actualPlayers.map(player => {
        const isWinner = player.team === finalWinningTeam;
        
        return {
          ...player,
          isWinner,
          winAmount: isWinner ? Math.floor(totalValue * 0.9 / actualPlayers.filter(p => p.team === finalWinningTeam).length) : 0,
          items: playerItems[player.id] || [],
          balance: playerTotals[player.id] || 0
        };
      });
      
      setResults(simulatedResults);
      setGameState('results');
    }, 1000);
  };

  useEffect(() => {
    if (countdown === null && gameState === 'spinning' && !sliderSpinning) {
      startSpinningProcess();
    }
  }, [countdown, gameState, sliderSpinning]);
  
  useEffect(() => {
    if (gameState === 'spinning' && countdown !== null) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            playSound('caseSelect');
            return null;
          }
          
          playSound('caseHover');
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameState, countdown]);

  const getTeamColor = (team: number) => {
    const teamColors = [
      'border-blue-500 bg-blue-500/10',
      'border-red-500 bg-red-500/10',
      'border-green-500 bg-green-500/10',
      'border-purple-500 bg-purple-500/10'
    ];
    
    return teamColors[team % teamColors.length];
  };

  const getTeamGradient = (team: number) => {
    const gradients = [
      'from-blue-700 to-blue-500',
      'from-red-700 to-red-500',
      'from-green-700 to-green-500',
      'from-purple-700 to-purple-500'
    ];
    
    return gradients[team % gradients.length];
  };

  const renderVSButton = (showBetween: number[] = [0, 2]) => {
    if (selectedMode === '2v2') {
      return (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-white">
            <span className="text-2xl font-bold text-white">VS</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-gradient-to-r from-blue-700 to-purple-700 rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white/50">
          <span className="text-lg font-bold text-white">VS</span>
        </div>
      </div>
    );
  };

  const renderPlayerSlot = (player: Player, index: number) => {
    const isReady = readyPlayers.includes(player.id) || player.isBot;
    const isCurrentUser = player.name === 'Truster8845';
    const teamColor = getTeamColor(player.team);
    const teamGradient = getTeamGradient(player.team);
    
    // Determine when to show VS buttons based on the selected mode
    let showVS = false;
    
    if (selectedMode === '1v1') {
      showVS = index === 0;
    } else if (selectedMode === '1v1v1') {
      showVS = index < actualPlayers.length - 1;
    } else if (selectedMode === '1v1v1v1') {
      showVS = index < actualPlayers.length - 1;
    } else if (selectedMode === '2v2') {
      showVS = index === 1; // For 2v2, we'll show a central VS button instead
    }

    if (gameState === 'waiting') {
      return (
        <div key={`player-${index}`} className={`bg-[#0d1b32] border-4 ${teamColor} rounded-lg p-4 relative`}>
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
            <div className="px-2 py-1 bg-gradient-to-r rounded text-xs text-white font-bold"
                style={{ 
                  background: `linear-gradient(90deg, ${player.team === 0 ? '#1e3a8a, #2563eb' : 
                                                    player.team === 1 ? '#991b1b, #dc2626' :
                                                    player.team === 2 ? '#166534, #22c55e' : 
                                                    '#6b21a8, #a855f7'})`
                }}>
              TEAM {player.team === 0 ? 'BLUE' : 
                    player.team === 1 ? 'RED' : 
                    player.team === 2 ? 'GREEN' : 'PURPLE'}
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
          
          {showVS && renderVSButton()}
        </div>
      );
    } else if (gameState === 'spinning') {
      return (
        <div key={`spinning-${index}`} className={`bg-[#0d1b32] border-4 ${teamColor} rounded-lg p-4 relative`}>
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
            <div className="px-2 py-1 bg-gradient-to-r rounded text-xs text-white font-bold"
                style={{ 
                  background: `linear-gradient(90deg, ${player.team === 0 ? '#1e3a8a, #2563eb' : 
                                                    player.team === 1 ? '#991b1b, #dc2626' :
                                                    player.team === 2 ? '#166534, #22c55e' : 
                                                    '#6b21a8, #a855f7'})`
                }}>
              TEAM {player.team === 0 ? 'BLUE' : 
                    player.team === 1 ? 'RED' : 
                    player.team === 2 ? 'GREEN' : 'PURPLE'}
            </div>
          </div>

          <div className="min-h-[180px] flex items-center justify-center">
            <div className="w-full">
              <CaseSlider
                items={sliderItems}
                onComplete={() => {}}
                autoSpin={true}
                isSpinning={sliderSpinning}
                playerName={player.name}
                highlightPlayer={player.team === winningTeam}
                options={{ duration: 5000, itemSize: 'small' }}
                isCompact={true}
                caseName={actualCases[currentCaseIndex]?.name || `Case ${currentCaseIndex + 1}`}
                spinDuration={5000}
              />
            </div>
          </div>
          
          {showVS && renderVSButton()}
        </div>
      );
    } else {
      const result = results.find(r => r.id === player.id);
      const isWinner = result?.isWinner;
      const playerItemsArray = playerItems[player.id] || [];
      const totalPlayerValue = playerItemsArray.reduce((sum, item) => sum + item.price, 0);
      
      return (
        <div key={`result-${index}`} className={`bg-[#0d1b32] border-4 ${teamColor} rounded-lg p-4 relative`}>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 overflow-hidden rounded-full border border-[#1a2c4c] mr-2">
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{player.name}</div>
              <div className="flex items-center">
                <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                <span className="text-white">{totalPlayerValue.toFixed(2)}</span>
              </div>
            </div>
            <div className="px-2 py-1 bg-gradient-to-r rounded text-xs text-white font-bold"
                style={{ 
                  background: `linear-gradient(90deg, ${player.team === 0 ? '#1e3a8a, #2563eb' : 
                                                    player.team === 1 ? '#991b1b, #dc2626' :
                                                    player.team === 2 ? '#166534, #22c55e' : 
                                                    '#6b21a8, #a855f7'})`
                }}>
              TEAM {player.team === 0 ? 'BLUE' : 
                    player.team === 1 ? 'RED' : 
                    player.team === 2 ? 'GREEN' : 'PURPLE'}
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
          
          {showVS && renderVSButton()}
        </div>
      );
    }
  };

  const renderItemResults = () => {
    if (gameState !== 'results') return null;
    
    return (
      <div className="mt-6 space-y-6">
        {actualPlayers.map((player) => {
          const items = playerItems[player.id] || [];
          if (items.length === 0) return null;
          
          const teamColor = getTeamColor(player.team);
          const teamGradient = getTeamGradient(player.team);
          
          return (
            <div key={`player-items-${player.id}`} className="space-y-3">
              <div className={`flex items-center p-2 ${teamColor} rounded-lg`}>
                <div className="w-8 h-8 overflow-hidden rounded-full border mr-2">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-white font-medium">{player.name}'s Items</div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {items.map((item, itemIdx) => (
                  <div 
                    key={`item-${player.id}-${itemIdx}`} 
                    className={`bg-[#0d1b32] border-2 rounded-lg p-4 relative ${
                      player.team === 0 
                        ? 'border-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                        : player.team === 1 
                          ? 'border-red-500 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                          : player.team === 2
                            ? 'border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                            : 'border-purple-500 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    }`}
                  >
                    <div 
                      className="absolute top-0 left-0 px-2 py-1 text-xs font-bold text-white rounded-br"
                      style={{ 
                        background: player.team === 0 
                          ? 'linear-gradient(90deg, #1e3a8a, #2563eb)' 
                          : player.team === 1
                            ? 'linear-gradient(90deg, #991b1b, #dc2626)'
                            : player.team === 2
                              ? 'linear-gradient(90deg, #166534, #22c55e)'
                              : 'linear-gradient(90deg, #6b21a8, #a855f7)'
                      }}
                    >
                      {player.name}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#0f2e3b] text-[#00d7a3] px-2 py-0.5 rounded text-sm">
                      {item.rarity === 'legendary' ? '1%' : 
                      item.rarity === 'epic' ? '5%' : 
                      item.rarity === 'rare' ? '10%' : 
                      item.rarity === 'uncommon' ? '30%' : '54%'}
                    </div>
                    <div className="flex justify-center mb-2 mt-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-contain" 
                      />
                    </div>
                    <div className="text-center text-white text-sm mb-1 font-medium">
                      {item.name}
                    </div>
                    <div className="flex items-center justify-center">
                      <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                      <span className="text-white font-bold">{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderModeSelector = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        <Button 
          variant={selectedMode === '1v1' ? "default" : "outline"} 
          onClick={() => setSelectedMode('1v1')}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          1v1
        </Button>
        <Button 
          variant={selectedMode === '1v1v1' ? "default" : "outline"} 
          onClick={() => setSelectedMode('1v1v1')}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          1v1v1
        </Button>
        <Button 
          variant={selectedMode === '1v1v1v1' ? "default" : "outline"} 
          onClick={() => setSelectedMode('1v1v1v1')}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          1v1v1v1
        </Button>
        <Button 
          variant={selectedMode === '2v2' ? "default" : "outline"} 
          onClick={() => setSelectedMode('2v2')}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          2v2
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-[#0a1424] rounded-lg border border-[#1a2c4c] p-4 mb-6 relative">
        {countdown !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-80">
            <div className="text-8xl font-bold text-[#00d7a3] animate-pulse">{countdown}</div>
            {currentCaseIndex > 0 && (
              <div className="text-xl font-bold text-white mt-4">
                Preparing Case {currentCaseIndex + 1}/{actualCases.length}
              </div>
            )}
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
              Waiting For Players ({readyPlayers.length}/{actualPlayers.filter(p => p.name !== '').length})
              <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 ml-2" />
              <span className="text-white font-bold">...</span>
            </div>
          )}
          
          {gameState === 'spinning' && currentCaseIndex < actualCases.length && (
            <div className="flex items-center text-xl font-bold text-white">
              Opening Case {currentCaseIndex + 1}/{actualCases.length}: {actualCases[currentCaseIndex]?.name}
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

        {gameState === 'waiting' && renderModeSelector()}

        <div className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="bg-[#0f2e3b] text-[#00d7a3] px-4 py-1 rounded-md">{selectedMode}</div>
            <div className="flex flex-col items-center">
              {gameState === 'spinning' && (
                <div className="text-white text-md font-bold mb-2">
                  {currentCaseIndex + 1} / {actualCases.length}: {actualCases[currentCaseIndex]?.name}
                </div>
              )}
              <div className="flex items-center gap-4">
                {actualCases.map((caseItem, idx) => (
                  <div 
                    key={`case-preview-${idx}`} 
                    className={`w-12 h-12 rounded-md transition-all duration-300 ${
                      currentCaseIndex === idx && gameState === 'spinning' 
                        ? 'ring-4 ring-[#00d7a3] scale-110 z-10' 
                        : idx < currentCaseIndex 
                          ? 'opacity-50 scale-90' 
                          : ''
                    }`}
                  >
                    <img 
                      src={caseItem.image} 
                      alt={caseItem.name} 
                      className={`w-full h-full object-contain ${
                        currentCaseIndex === idx && gameState === 'spinning' ? 'animate-pulse' : ''
                      }`} 
                    />
                    {idx === currentCaseIndex && gameState === 'spinning' && (
                      <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#00d7a3]"></div>
                    )}
                  </div>
                ))}
                {Array.from({ length: 9 - actualCases.length }).map((_, idx) => (
                  <div key={`empty-case-preview-${idx}`} className="w-12 h-12 bg-[#0d1b32] border border-[#1a2c4c] rounded"></div>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Total Value</span>
              <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
              <span className="text-white font-bold">{totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actualPlayers.map((player, index) => renderPlayerSlot(player, index))}
          
          {selectedMode === '2v2' && gameState !== 'results' && (
            renderVSButton([])
          )}
        </div>
        
        {renderItemResults()}
      </div>
    </div>
  );
};

export default CaseBattleGame;

