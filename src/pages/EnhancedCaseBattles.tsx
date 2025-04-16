import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Plus, X, ChevronDown, ChevronUp, Search, Filter, User, Users, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CaseBattleGame from '@/components/CaseBattle/EnhancedCaseBattleGame';
import useSoundEffect from '@/hooks/useSoundEffect';
import { toast } from 'sonner';

// Mock case data
const casesData = [
  { id: 1, name: 'Happy Birthday', price: 29.92, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  { id: 2, name: 'Muertos Death', price: 33.23, image: '/lovable-uploads/d10cbc3f-e87e-4657-b963-ce96a76f4d0d.png' },
  { id: 3, name: 'Eggtastic Bomb', price: 66.15, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  { id: 4, name: 'Glass World', price: 99.28, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  { id: 5, name: "What's This", price: 140.58, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  { id: 6, name: 'Dark Magician', price: 157.11, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  { id: 7, name: '5050 BrokeBoy', price: 232.29, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  { id: 8, name: "It's Gucci", price: 328.71, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  { id: 9, name: 'Rainbow Heaven', price: 618.83, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
  { id: 10, name: 'Shining Galaxy', price: 961.22, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png' },
];

// Mock items that can be won from cases
const itemsData = [
  { id: 1, name: 'Catrina Día de Muertos Mask', price: 138, rarity: 'rare', image: '/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png', dropChance: '5%' },
  { id: 2, name: 'Bozo', price: 10, rarity: 'common', image: '', dropChance: '95%' },
];

const EnhancedCaseBattles = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCaseSelectOpen, setIsCaseSelectOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('2v2');
  const [selectedVersion, setSelectedVersion] = useState('STANDARD');
  const [battleOptions, setBattleOptions] = useState({
    cursedMode: false,
    terminalMode: false,
    privateBattle: false,
    affiliatesOnly: false,
    minLevel: 0,
    battleFunding: 0,
  });
  const [selectedCases, setSelectedCases] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [gamePhase, setGamePhase] = useState<'creation' | 'waiting' | 'playing' | 'results'>('creation');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('LOWEST');
  const [battleStarted, setBattleStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [battleResults, setBattleResults] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([
    { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', ready: false, isBot: false, team: 0 },
    { id: 2, name: '', avatar: '', ready: false, isBot: false, team: 0 },
    { id: 3, name: '', avatar: '', ready: false, isBot: false, team: 1 },
    { id: 4, name: '', avatar: '', ready: false, isBot: false, team: 1 },
  ]);

  const { playSound } = useSoundEffect();

  useEffect(() => {
    let sum = 0;
    selectedCases.forEach(caseItem => {
      sum += caseItem.price * caseItem.quantity;
    });
    setTotalCost(sum);
  }, [selectedCases]);

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    playSound('caseSelect');
  };

  const handleVersionSelect = (version: string) => {
    setSelectedVersion(version);
    playSound('caseSelect');
  };

  const handleToggleOption = (option: keyof typeof battleOptions) => {
    setBattleOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
    playSound('caseSelect');
  };

  const handleAddCase = () => {
    setIsCaseSelectOpen(true);
    playSound('caseSelect');
  };

  const handleSelectCase = (caseItem: any) => {
    const existingIndex = selectedCases.findIndex(c => c.id === caseItem.id);
    
    if (existingIndex >= 0) {
      const updatedCases = [...selectedCases];
      updatedCases[existingIndex].quantity += 1;
      setSelectedCases(updatedCases);
    } else {
      setSelectedCases([...selectedCases, { ...caseItem, quantity: 1 }]);
    }
    
    playSound('caseSelect');
  };

  const handleRemoveCase = (index: number) => {
    const updatedCases = [...selectedCases];
    updatedCases.splice(index, 1);
    setSelectedCases(updatedCases);
    playSound('caseSelect');
  };

  const handleQuantityChange = (index: number, change: number) => {
    const updatedCases = [...selectedCases];
    const newQuantity = Math.max(1, updatedCases[index].quantity + change);
    updatedCases[index].quantity = newQuantity;
    setSelectedCases(updatedCases);
    playSound('caseSelect');
  };

  const handleCreateBattle = () => {
    if (selectedCases.length === 0) {
      toast.error("Please select at least one case");
      return;
    }
    
    setGamePhase('waiting');
    playSound('caseSelect');
  };

  const handleAddBot = (playerIndex: number) => {
    const updatedPlayers = [...players];
    const randomId = Math.floor(Math.random() * 1000);
    const botNames = ['BinLaden', 'P. Diddy', 'Al Qaida'];
    
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      name: botNames[Math.floor(Math.random() * botNames.length)],
      avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png',
      ready: true,
      isBot: true
    };
    
    setPlayers(updatedPlayers);
    
    // Check if all players are ready
    const allReady = updatedPlayers.every(player => player.ready || player.isBot);
    if (allReady) {
      startBattle();
    }
  };

  const handleToggleReady = (playerIndex: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex].ready = !updatedPlayers[playerIndex].ready;
    setPlayers(updatedPlayers);
    
    // Check if all players are ready
    const allReady = updatedPlayers.every(player => player.ready || player.isBot || player.name === '');
    if (allReady && updatedPlayers.filter(p => p.name !== '').length > 1) {
      startBattle();
    }
  };

  const startBattle = () => {
    setBattleStarted(true);
    setGamePhase('playing');
    
    // Start countdown
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          
          // After countdown, show results after 5 seconds
          setTimeout(() => {
            const team1 = players.filter(p => p.team === 0 && p.name !== '');
            const team2 = players.filter(p => p.team === 1 && p.name !== '');
            
            // Determine winner randomly
            const winningTeam = Math.random() > 0.5 ? 0 : 1;
            const winningPlayers = players.map(p => ({
              ...p,
              result: p.team === winningTeam ? 'WINNER' : 'LOST BATTLE',
              winnings: p.team === winningTeam ? Math.floor(totalCost * 0.9 / team1.length) : 0,
              items: p.team === winningTeam ? [itemsData[0]] : [itemsData[1]]
            }));
            
            setBattleResults({
              winners: winningPlayers.filter(p => p.team === winningTeam),
              losers: winningPlayers.filter(p => p.team !== winningTeam),
              players: winningPlayers
            });
            
            setGamePhase('results');
          }, 5000);
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRecreate = () => {
    setGamePhase('creation');
    setBattleStarted(false);
    setCountdown(null);
    setBattleResults(null);
    setPlayers([
      { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', ready: false, isBot: false, team: 0 },
      { id: 2, name: '', avatar: '', ready: false, isBot: false, team: 0 },
      { id: 3, name: '', avatar: '', ready: false, isBot: false, team: 1 },
      { id: 4, name: '', avatar: '', ready: false, isBot: false, team: 1 },
    ]);
  };

  const filteredCases = casesData.filter(caseItem => 
    caseItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => 
    sortOrder === 'LOWEST' ? a.price - b.price : b.price - a.price
  );

  const renderBattleCreation = () => (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-[#0a1424] rounded-lg border border-[#1a2c4c] p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Link 
            to="/case-battles" 
            className="flex items-center text-gray-300 hover:text-white transition-colors mr-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to lobby
          </Link>
          <div className="flex items-center text-xl font-bold text-white">
            <div className="text-[#00d7a3] mr-2 font-medium">✗</div>
            BATTLES CREATION
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-400 mb-4">Choose A Mode</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button 
                onClick={() => handleModeSelect('1v1')}
                className={`flex items-center justify-center p-3 rounded-md border ${selectedMode === '1v1' ? 'border-[#00d7a3] bg-[#0f2e3b]' : 'border-[#1a2c4c] bg-[#0d1b32]'} transition-colors`}
              >
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">1v1</span>
              </button>
              <button 
                onClick={() => handleModeSelect('1v1v1')}
                className={`flex items-center justify-center p-3 rounded-md border ${selectedMode === '1v1v1' ? 'border-[#00d7a3] bg-[#0f2e3b]' : 'border-[#1a2c4c] bg-[#0d1b32]'} transition-colors`}
              >
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">1v1v1</span>
              </button>
              <button 
                onClick={() => handleModeSelect('1v1v1v1')}
                className={`flex items-center justify-center p-3 rounded-md border ${selectedMode === '1v1v1v1' ? 'border-[#00d7a3] bg-[#0f2e3b]' : 'border-[#1a2c4c] bg-[#0d1b32]'} transition-colors`}
              >
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">1v1v1v1</span>
              </button>
              <button 
                onClick={() => handleModeSelect('2v2')}
                className={`flex items-center justify-center p-3 rounded-md border ${selectedMode === '2v2' ? 'border-[#00d7a3] bg-[#0f2e3b]' : 'border-[#1a2c4c] bg-[#0d1b32]'} transition-colors`}
              >
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">2v2</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 mb-4">Choose Version</h3>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleVersionSelect('STANDARD')}
                className={`flex items-center justify-center p-3 rounded-md border ${selectedVersion === 'STANDARD' ? 'border-[#00d7a3] bg-[#0f2e3b]' : 'border-[#1a2c4c] bg-[#0d1b32]'} transition-colors`}
              >
                <span className="text-[#00d7a3] mr-2">vs</span>
                <span className="text-white">STANDARD</span>
              </button>
              <button 
                onClick={() => handleVersionSelect('GROUP')}
                className={`flex items-center justify-center p-3 rounded-md border ${selectedVersion === 'GROUP' ? 'border-[#00d7a3] bg-[#0f2e3b]' : 'border-[#1a2c4c] bg-[#0d1b32]'} transition-colors`}
              >
                <span className="text-white">GROUP</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => {
              const caseData = selectedCases[index];
              
              if (caseData) {
                return (
                  <div key={`selected-case-${index}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg overflow-hidden p-4">
                    <div className="text-center text-white font-medium mb-2">{caseData.name}</div>
                    <div className="flex justify-center mb-2">
                      <div className="flex items-center">
                        <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
                        <span className="text-white font-bold">{caseData.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-center mb-3">
                      <img src={caseData.image} alt={caseData.name} className="w-24 h-24 object-contain" />
                    </div>
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => handleQuantityChange(index, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-[#1a2c4c] rounded text-white hover:bg-[#253e64] transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-medium">{caseData.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(index, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-[#1a2c4c] rounded text-white hover:bg-[#253e64] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              }
              
              return (
                <div 
                  key={`empty-case-${index}`} 
                  onClick={handleAddCase}
                  className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#253e64] transition-colors h-52"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-[#1a2c4c] rounded-md">
                    <Plus className="w-5 h-5 text-[#00d7a3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
          <button 
            onClick={() => handleToggleOption('cursedMode')}
            className={`flex items-center p-3 rounded-md border ${battleOptions.cursedMode ? 'border-[#00d7a3]' : 'border-[#1a2c4c]'} transition-colors`}
          >
            <span className="text-gray-400 mr-2">☠</span>
            <span className="text-gray-300">CURSED MODE</span>
            <div className={`ml-auto w-6 h-3 rounded-full ${battleOptions.cursedMode ? 'bg-[#00d7a3]' : 'bg-[#1a2c4c]'}`}>
              <div 
                className={`w-3 h-3 rounded-full bg-white transform ${battleOptions.cursedMode ? 'translate-x-3' : 'translate-x-0'} transition-transform`}
              ></div>
            </div>
          </button>
          
          <button 
            onClick={() => handleToggleOption('terminalMode')}
            className={`flex items-center p-3 rounded-md border ${battleOptions.terminalMode ? 'border-[#00d7a3]' : 'border-[#1a2c4c]'} transition-colors`}
          >
            <span className="text-gray-400 mr-2">⚙</span>
            <span className="text-gray-300">TERMINAL MODE</span>
            <div className={`ml-auto w-6 h-3 rounded-full ${battleOptions.terminalMode ? 'bg-[#00d7a3]' : 'bg-[#1a2c4c]'}`}>
              <div 
                className={`w-3 h-3 rounded-full bg-white transform ${battleOptions.terminalMode ? 'translate-x-3' : 'translate-x-0'} transition-transform`}
              ></div>
            </div>
          </button>
          
          <button 
            onClick={() => handleToggleOption('privateBattle')}
            className={`flex items-center p-3 rounded-md border ${battleOptions.privateBattle ? 'border-[#00d7a3]' : 'border-[#1a2c4c]'} transition-colors`}
          >
            <span className="text-gray-300">PRIVATE BATTLE</span>
            <div className={`ml-auto w-6 h-3 rounded-full ${battleOptions.privateBattle ? 'bg-[#00d7a3]' : 'bg-[#1a2c4c]'}`}>
              <div 
                className={`w-3 h-3 rounded-full bg-white transform ${battleOptions.privateBattle ? 'translate-x-3' : 'translate-x-0'} transition-transform`}
              ></div>
            </div>
          </button>
          
          <button 
            onClick={() => handleToggleOption('affiliatesOnly')}
            className={`flex items-center p-3 rounded-md border ${battleOptions.affiliatesOnly ? 'border-[#00d7a3]' : 'border-[#1a2c4c]'} transition-colors`}
          >
            <span className="text-gray-300">AFFILIATES ONLY</span>
            <div className={`ml-auto w-6 h-3 rounded-full ${battleOptions.affiliatesOnly ? 'bg-[#00d7a3]' : 'bg-[#1a2c4c]'}`}>
              <div 
                className={`w-3 h-3 rounded-full bg-white transform ${battleOptions.affiliatesOnly ? 'translate-x-3' : 'translate-x-0'} transition-transform`}
              ></div>
            </div>
          </button>
          
          <div className="flex items-center p-3 rounded-md border border-[#1a2c4c]">
            <span className="text-gray-300">MIN. LEVEL</span>
            <span className="ml-auto font-bold text-white">{battleOptions.minLevel}</span>
          </div>
          
          <div className="flex items-center p-3 rounded-md border border-[#1a2c4c]">
            <span className="text-gray-300">BATTLE FUNDING</span>
            <span className="ml-auto font-bold text-white">{battleOptions.battleFunding}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWaitingForPlayers = () => {
    const playerCount = players.filter(p => p.name !== '').length;
    const totalPlayers = selectedMode === '2v2' ? 4 : (
      selectedMode === '1v1v1v1' ? 4 : (
        selectedMode === '1v1v1' ? 3 : 2
      )
    );
    
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="bg-[#0a1424] rounded-lg border border-[#1a2c4c] p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <Link 
              to="/case-battles" 
              className="flex items-center text-gray-300 hover:text-white transition-colors mr-4"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to lobby
            </Link>
            <div className="flex items-center text-xl font-bold text-white">
              Waiting For Players ({playerCount}/{totalPlayers})
              <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 ml-2" />
              <span className="text-white font-bold">...</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-transparent border border-[#1a2c4c] hover:border-[#253e64] text-white rounded-md p-2 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </button>
              <button className="bg-transparent border border-[#1a2c4c] hover:border-[#253e64] text-white rounded-md px-4 py-2 transition-colors">
                <div className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  <span className="ml-2">Fairness</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="bg-[#0f2e3b] text-[#00d7a3] px-4 py-1 rounded-md">{selectedMode}</div>
              <div className="flex items-center gap-4">
                {selectedCases.map((caseItem, idx) => (
                  <div key={`case-preview-${idx}`} className="w-12 h-12">
                    <img src={caseItem.image} alt={caseItem.name} className="w-full h-full object-contain" />
                  </div>
                ))}
                {Array.from({ length: 9 - selectedCases.length }).map((_, idx) => (
                  <div key={`empty-case-preview-${idx}`} className="w-12 h-12 bg-[#0d1b32] border border-[#1a2c4c] rounded"></div>
                ))}
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">Total Value</span>
                <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
                <span className="text-white font-bold">{totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {players.map((player, index) => (
              <div key={`player-${index}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 overflow-hidden rounded-full border border-[#1a2c4c] mr-2">
                    {player.avatar ? (
                      <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#1a2c4c] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
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
                  {index === 0 && !player.ready ? (
                    <button 
                      onClick={() => handleToggleReady(index)}
                      className="bg-[#0f2e3b] border border-[#00d7a3] text-white rounded-md px-4 py-2 hover:bg-[#1a5a4f] transition-colors w-full"
                    >
                      <div className="flex items-center justify-center">
                        <span className="text-[#00d7a3] mr-2">✓</span>
                        <span>Player Ready</span>
                      </div>
                    </button>
                  ) : index === 0 && player.ready ? (
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
                        onClick={() => handleAddBot(index)}
                        className="bg-[#0f2e3b] border border-[#00d7a3] text-white rounded-md px-4 py-2 hover:bg-[#1a5a4f] transition-colors"
                      >
                        <div className="flex items-center">
                          <Bot className="w-5 h-5 mr-2 text-[#00d7a3]" />
                          <span>Call Bot</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
                
                {index === 1 && (
                  <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                    <div className="bg-[#0f2e3b] border border-[#00d7a3] text-[#00d7a3] rounded-full w-12 h-12 flex items-center justify-center">
                      vs
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBattlePlay = () => (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-[#0a1424] rounded-lg border border-[#1a2c4c] p-4 mb-6 relative">
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
            <div className="text-8xl font-bold text-[#00d7a3]">{countdown}</div>
          </div>
        )}
        
        <div className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="bg-[#0f2e3b] text-[#00d7a3] px-4 py-1 rounded-md">{selectedMode}</div>
            <div className="flex items-center gap-4">
              {selectedCases.map((caseItem, idx) => (
                <div key={`case-preview-${idx}`} className="w-12 h-12">
                  <img src={caseItem.image} alt={caseItem.name} className="w-full h-full object-contain animate-bounce" />
                </div>
              ))}
              {Array.from({ length: 9 - selectedCases.length }).map((_, idx) => (
                <div key={`empty-case-preview-${idx}`} className="w-12 h-12 bg-[#0d1b32] border border-[#1a2c4c] rounded"></div>
              ))}
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Total Value</span>
              <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
              <span className="text-white font-bold">{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {players.filter(p => p.name !== '').map((player, index) => (
            <div key={`playing-player-${index}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4">
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
                    src={itemsData[0].image} 
                    alt="Skull Mask" 
                    className={`w-16 h-16 object-contain ${countdown === null ? 'animate-pulse' : ''}`} 
                  />
                  {index % 2 === 0 && (
                    <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 text-red-500 text-3xl font-bold">👹</div>
                  )}
                  {index === 1 && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                      <img src="/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png" alt="Animated coin" className="w-12 h-12 animate-spin" />
                    </div>
                  )}
                  {index % 2 === 1 && (
                    <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 text-red-500 text-3xl font-bold">👹</div>
                  )}
                </div>
              </div>
              
              {index === 1 && (
                <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                  <div className="bg-[#0f2e3b] border border-[#00d7a3] text-[#00d7a3] rounded-full w-12 h-12 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBattleResults = () => (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-[#0a1424] rounded-lg border border-[#1a2c4c] p-4 mb-6">
        <div className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="bg-[#0f2e3b] text-[#00d7a3] px-4 py-1 rounded-md">{selectedMode}</div>
            <div className="flex items-center gap-4">
              {selectedCases.map((caseItem, idx) => (
                <div key={`case-result-${idx}`} className="w-12 h-12">
                  <img src={caseItem.image} alt={caseItem.name} className="w-full h-full object-contain" />
                </div>
              ))}
              {Array.from({ length: 9 - selectedCases.length }).map((_, idx) => (
                <div key={`empty-case-result-${idx}`} className="w-12 h-12 bg-[#0d1b32] border border-[#1a2c4c] rounded"></div>
              ))}
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Total Value</span>
              <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
              <span className="text-white font-bold">{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {battleResults?.players.map((player, index) => (
            <div key={`result-player-${index}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 relative">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 overflow-hidden rounded-full border border-[#1a2c4c] mr-2">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{player.name}</div>
                  <div className="flex items-center">
                    <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                    <span className="text-white">{player.team === 0 ? 10 : (player.name === 'P. Diddy' ? 138 : 10)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a1424] border border-[#1a2c4c] rounded-lg p-4 mb-4">
                <div className={`text-center font-bold text-xl ${player.result === 'WINNER' ? 'text-[#00d7a3]' : 'text-red-500'}`}>
                  {player.result}
                </div>
                {player.result === 'WINNER' && (
                  <div className="flex items-center justify-center mt-2">
                    <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
                    <span className="text-white font-bold">+84.50</span>
                  </div>
                )}
              </div>
              
              {index === 0 && (
                <button 
                  onClick={handleRecreate}
                  className="flex items-center justify-center bg-[#0f2e3b] hover:bg-[#1a5a4f] border border-[#00d7a3] text-white rounded-md px-4 py-2 w-full transition-colors"
                >
                  <svg className="w-5 h-5 mr-2 text-[#00d7a3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v6h6"></path>
                    <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
                  </svg>
                  <span>Recreate Battle</span>
                </button>
              )}
              
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${player.result === 'WINNER' ? 'bg-[#00d7a3]' : 'bg-red-500'}`}></div>
              
              {index === 1 && (
                <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                  <div className="bg-[#0f2e3b] border border-[#00d7a3] text-[#00d7a3] rounded-full w-12 h-12 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {battleResults?.players.flatMap(player => 
            player.items.map((item, itemIdx) => (
              <div key={`item-${player.id}-${itemIdx}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-4 relative">
                <div className="absolute top-3 right-3 bg-[#0f2e3b] text-[#00d7a3] px-2 py-0.5 rounded text-sm">
                  {item.dropChance}
                </div>
                <div className="flex justify-center mb-2">
                  <img 
                    src={item.image || (player.name === player.name ? '/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png' : '')} 
                    alt={item.name} 
                    className="w-16 h-16 object-contain" 
                  />
                </div>
                <div className="text-center text-white text-sm mb-1">
                  {player.name === 'P. Diddy' ? 'Catrina Día de Muertos Mask' : 'Bozo'}
                </div>
                <div className="flex items-center justify-center">
                  <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                  <span className="text-white font-bold">{player.name === 'P. Diddy' ? '138.00' : '10.00'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080F1C] text-white pb-10">
      {gamePhase === 'creation' && renderBattleCreation()}
      {gamePhase === 'waiting' && renderWaitingForPlayers()}
      {gamePhase === 'playing' && renderBattlePlay()}
      {gamePhase === 'results' && renderBattleResults()}
      
      <Dialog 
        open={isCaseSelectOpen} 
        onOpenChange={setIsCaseSelectOpen}
      >
        <DialogContent className="bg-[#0a1424] border border-[#1a2c4c] text-white max-w-4xl p-0 rounded-lg">
          <div className="p-4">
            <div className="flex items-center mb-6">
              <div className="text-xl font-bold flex items-center">
                <div className="text-[#00d7a3] mr-2 font-medium">✗</div>
                BATTLES CREATION
              </div>
              <div className="flex-1 mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="SEARCH FOR CASES..." 
                    className="w-full bg-[#0d1b32] border border-[#1a2c4c] rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#00d7a3]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button className="flex items-center bg-[#0d1b32] border border-[#1a2c4c] rounded-md py-2 px-4">
                    <Filter className="w-5 h-5 mr-2 text-[#00d7a3]" />
                    <span className="mr-1">SORT BY:</span>
                    <span className="font-bold">{sortOrder}</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  
                  {/* Dropdown could be implemented here */}
                </div>
                <button 
                  onClick={() => setIsCaseSelectOpen(false)}
                  className="bg-transparent hover:bg-[#1a2c4c] rounded-md p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              {filteredCases.map((caseItem) => (
                <div 
                  key={`selectable-case-${caseItem.id}`} 
                  className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg overflow-hidden p-4 hover:border-[#253e64] transition-colors cursor-pointer"
                  onClick={() => handleSelectCase(caseItem)}
                >
                  <div className="text-center text-white font-medium mb-2">{caseItem.name}</div>
                  <div className="flex justify-center mb-2">
                    <div className="flex items-center">
                      <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
                      <span className="text-white font-bold">{caseItem.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-center mb-3">
                    <img src={caseItem.image} alt={caseItem.name} className="w-24 h-24 object-contain" />
                  </div>
                  <button 
                    className="w-full h-8 flex items-center justify-center bg-[#1a2c4c] rounded text-white hover:bg-[#253e64] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-6 p-4 border-t border-[#1a2c4c]">
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">Total Cost</span>
                <div className="flex items-center">
                  <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
                  <span className="text-white font-bold">{totalCost.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setIsCaseSelectOpen(false);
                  playSound('caseSelect');
                }} 
                className="bg-[#00d7a3] hover:bg-[#00bf8f] text-white rounded-md px-6 py-2 transition-colors"
              >
                <span className="text-white mr-2 font-medium">✗</span>
                CREATE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedCaseBattles;
