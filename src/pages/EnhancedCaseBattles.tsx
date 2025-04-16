import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Plus, X, ChevronDown, Search, Filter, User, Users, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CaseBattleGame from '@/components/CaseBattle/EnhancedCaseBattleGame';
import useSoundEffect from '@/hooks/useSoundEffect';
import { toast } from 'sonner';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';

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

// Convert items data to match SliderItem type
const itemsData: SliderItem[] = [
  { id: '1', name: 'Catrina Día de Muertos Mask', price: 138, rarity: 'rare', image: '/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png' },
  { id: '2', name: 'Bozo', price: 10, rarity: 'common', image: '/placeholder.svg' },
  { id: '3', name: 'Gold Chain', price: 55, rarity: 'uncommon', image: '/placeholder.svg' },
  { id: '4', name: 'Diamond Ring', price: 280, rarity: 'epic', image: '/placeholder.svg' },
  { id: '5', name: 'Rare Gem', price: 425, rarity: 'legendary', image: '/placeholder.svg' },
];

// Additional slider items for more variety
const sliderItems: SliderItem[] = [
  ...itemsData,
  { id: '6', name: 'Emerald Necklace', image: '/placeholder.svg', rarity: 'rare', price: 175 },
  { id: '7', name: 'Golden Statue', image: '/placeholder.svg', rarity: 'epic', price: 320 },
  { id: '8', name: 'Silver Watch', image: '/placeholder.svg', rarity: 'uncommon', price: 85 },
  { id: '9', name: 'Bronze Medal', image: '/placeholder.svg', rarity: 'common', price: 15 },
  { id: '10', name: 'Platinum Trophy', image: '/placeholder.svg', rarity: 'legendary', price: 580 }
];

interface EnhancedCaseBattlesProps {
  onBack?: () => void;
}

const EnhancedCaseBattles: React.FC<EnhancedCaseBattlesProps> = ({ onBack }) => {
  const navigate = useNavigate();
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
  const [sliderSpinning, setSliderSpinning] = useState(false);
  const [playerItems, setPlayerItems] = useState<Record<number, SliderItem[]>>({});

  const { playSound } = useSoundEffect();

  // Update total cost when cases change
  useEffect(() => {
    let sum = 0;
    selectedCases.forEach(caseItem => {
      sum += caseItem.price * caseItem.quantity;
    });
    setTotalCost(sum);
  }, [selectedCases]);

  // Update players based on selected mode
  useEffect(() => {
    updatePlayersByMode(selectedMode);
  }, [selectedMode]);

  const updatePlayersByMode = (mode: string) => {
    switch(mode) {
      case '1v1':
        setPlayers([
          { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', ready: false, isBot: false, team: 0 },
          { id: 2, name: '', avatar: '', ready: false, isBot: false, team: 1 }
        ]);
        break;
      case '1v1v1':
        setPlayers([
          { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', ready: false, isBot: false, team: 0 },
          { id: 2, name: '', avatar: '', ready: false, isBot: false, team: 1 },
          { id: 3, name: '', avatar: '', ready: false, isBot: false, team: 2 }
        ]);
        break;
      case '1v1v1v1':
        setPlayers([
          { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', ready: false, isBot: false, team: 0 },
          { id: 2, name: '', avatar: '', ready: false, isBot: false, team: 1 },
          { id: 3, name: '', avatar: '', ready: false, isBot: false, team: 2 },
          { id: 4, name: '', avatar: '', ready: false, isBot: false, team: 3 }
        ]);
        break;
      case '2v2':
      default:
        setPlayers([
          { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', ready: false, isBot: false, team: 0 },
          { id: 2, name: '', avatar: '', ready: false, isBot: false, team: 0 },
          { id: 3, name: '', avatar: '', ready: false, isBot: false, team: 1 },
          { id: 4, name: '', avatar: '', ready: false, isBot: false, team: 1 }
        ]);
    }
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    updatePlayersByMode(mode);
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
    if (index >= 0 && index < updatedCases.length) {
      const newQuantity = updatedCases[index].quantity + change;
      
      if (newQuantity <= 0) {
        handleRemoveCase(index);
      } else {
        updatedCases[index].quantity = newQuantity;
        setSelectedCases([...updatedCases]);
      }
    }
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

  const handleBackToLobby = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/case-battles');
    }
  };

  const handleAddBot = (playerIndex: number) => {
    const updatedPlayers = [...players];
    const botNames = ['BinLaden', 'P. Diddy', 'Al Qaida'];
    
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      name: botNames[Math.floor(Math.random() * botNames.length)],
      avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png',
      ready: true,
      isBot: true
    };
    
    setPlayers(updatedPlayers);
    
    const allPlayersReady = checkAllPlayersReady(updatedPlayers);
    if (allPlayersReady) {
      startBattle();
    }
  };

  const checkAllPlayersReady = (playerList: any[]) => {
    const activePlayers = playerList.filter(p => p.name !== '');
    return activePlayers.every(player => player.ready || player.isBot) && activePlayers.length > 1;
  };

  const handleToggleReady = (playerIndex: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex].ready = !updatedPlayers[playerIndex].ready;
    setPlayers(updatedPlayers);
    
    const allPlayersReady = checkAllPlayersReady(updatedPlayers);
    if (allPlayersReady) {
      startBattle();
    }
  };

  const startBattle = () => {
    setBattleStarted(true);
    setGamePhase('playing');
    
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          
          setSliderSpinning(true);
          
          setTimeout(() => {
            setSliderSpinning(true);
            
            setTimeout(() => {
              finishBattle();
            }, 5000);
          }, 1000);
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishBattle = () => {
    setSliderSpinning(false);
    
    const updatedPlayerItems: Record<number, SliderItem[]> = {};
    const updatedPlayers = [...players].filter(p => p.name !== '');
    
    const teams = [...new Set(updatedPlayers.map(p => p.team))];
    const winningTeam = teams[Math.floor(Math.random() * teams.length)];
    
    const teamPlayers: Record<number, any[]> = {};
    teams.forEach(team => {
      teamPlayers[team] = updatedPlayers.filter(p => p.team === team);
    });
    
    updatedPlayers.forEach(player => {
      let playerItems: SliderItem[];
      let totalValue = 0;
      
      if (player.team === winningTeam) {
        const betterItems = sliderItems.filter(item => 
          item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'rare'
        );
        const randomItem = betterItems[Math.floor(Math.random() * betterItems.length)];
        playerItems = [randomItem];
        totalValue = randomItem.price;
      } else {
        const commonItems = sliderItems.filter(item => 
          item.rarity === 'common' || item.rarity === 'uncommon'
        );
        const randomItem = commonItems[Math.floor(Math.random() * commonItems.length)];
        playerItems = [randomItem];
        totalValue = randomItem.price;
      }
      
      updatedPlayerItems[player.id] = playerItems;
      
      player.result = player.team === winningTeam ? 'WINNER' : 'LOST BATTLE';
      player.winnings = player.team === winningTeam ? 
        Math.floor(totalCost * 0.9 / teamPlayers[player.team].length) : 0;
      player.totalValue = totalValue;
    });
    
    setPlayerItems(updatedPlayerItems);
    
    const winners = updatedPlayers.filter(p => p.team === winningTeam);
    const losers = updatedPlayers.filter(p => p.team !== winningTeam);
    
    setBattleResults({
      winners,
      losers,
      players: updatedPlayers
    });
    
    setGamePhase('results');
  };

  const handleRecreate = () => {
    setGamePhase('creation');
    setBattleStarted(false);
    setCountdown(null);
    setBattleResults(null);
    updatePlayersByMode(selectedMode);
  };

  const filteredCases = casesData.filter(caseItem => 
    caseItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => 
    sortOrder === 'LOWEST' ? a.price - b.price : b.price - a.price
  );

  const getActivePlayerCount = () => {
    return players.filter(p => p.name !== '').length;
  };

  const getTotalRequiredPlayers = () => {
    switch(selectedMode) {
      case '1v1': return 2;
      case '1v1v1': return 3;
      case '1v1v1v1': return 4;
      case '2v2': default: return 4;
    }
  };

  const renderBattleCreation = () => (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-[#0a1424] rounded-lg border border-[#1a2c4c] p-4 mb-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBackToLobby}
            className="flex items-center text-gray-300 hover:text-white transition-colors mr-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to lobby
          </button>
          <div className="flex items-center text-xl font-bold text-white">
            <div className="text-[#00d7a3] mr-2 font-medium">✗</div>
            BATTLES CREATION
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Total Cost</span>
              <div className="flex items-center">
                <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
                <span className="text-white font-bold">{totalCost.toFixed(2)}</span>
              </div>
            </div>
            <Button 
              onClick={handleCreateBattle} 
              className="bg-[#00d7a3] hover:bg-[#00bf8f] text-white rounded-md px-6 py-2 transition-colors"
            >
              <span className="text-white mr-2 font-medium">✗</span>
              CREATE
            </Button>
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
                        aria-label="Decrease quantity"
                        type="button"
                      >
                        -
                      </button>
                      <span className="text-white font-medium">{caseData.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(index, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-[#1a2c4c] rounded text-white hover:bg-[#253e64] transition-colors"
                        aria-label="Increase quantity"
                        type="button"
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
    const playerCount = getActivePlayerCount();
    const totalPlayers = getTotalRequiredPlayers();
    
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                
                {selectedMode === '2v2' && index === 1 && (
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

        <CaseBattleGame 
          cases={selectedCases.map(caseItem => ({
            id: String(caseItem.id),
            name: caseItem.name,
            price: caseItem.price,
            image: caseItem.image,
            items: itemsData
          }))} 
          users={players.filter(p => p.name !== '').map(player => ({
            id: String(player.id),
            name: player.name,
            avatar: player.avatar,
            items: [],
            totalWin: 0,
            team: player.team
          }))}
          isCursedMode={battleOptions.cursedMode}
          isGroupMode={selectedVersion === 'GROUP'}
          onFinish={(updatedUsers) => {
            setGamePhase('results');
            setBattleResults({
              players: updatedUsers,
              winners: updatedUsers.filter(u => u.totalWin > 0),
              losers: updatedUsers.filter(u => u.totalWin === 0)
            });
          }}
        />
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
                    <span className="text-white">{player.totalValue || 0}</span>
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
                    <span className="text-white font-bold">+{player.winnings?.toFixed(2) || '0.00'}</span>
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
              
              {index === 1 && players.filter(p => p.name !== '').length > 2 && (
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
          {battleResults?.players.map(player => {
            const playerItemsList = playerItems[player.id] || [];
            return playerItemsList.map((item, itemIdx) => (
              <div key={`item-${player.id}-${itemIdx}`} 
                   className={`bg-[#0d1b32] border-2 rounded-lg p-4 relative ${player.result === 'WINNER' ? 'border-[#00d7a3]' : 'border-red-500'}`}>
                <div className="absolute top-3 right-3 bg-[#0f2e3b] text-[#00d7a3] px-2 py-0.5 rounded text-sm">
                  {item.rarity === 'legendary' ? '1%' : 
                   item.rarity === 'epic' ? '5%' : 
                   item.rarity === 'rare' ? '10%' : 
                   item.rarity === 'uncommon' ? '30%' : '54%'}
                </div>
                <div className="flex justify-center mb-2">
                  <img 
                    src={item.image} 
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
                <div className="mt-2 text-xs text-center text-gray-400">
                  Won by {player.name}
                </div>
              </div>
            ));
          })}
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
