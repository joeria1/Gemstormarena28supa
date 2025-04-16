
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, X, ChevronDown, ChevronUp, Search, Filter, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
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

interface CaseBattleCreateProps {
  onBack?: () => void;
  onCreateBattle?: (battleData: any) => void;
}

const CaseBattleCreate: React.FC<CaseBattleCreateProps> = ({ onBack, onCreateBattle }) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('LOWEST');
  
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
    
    if (onCreateBattle) {
      onCreateBattle({
        mode: selectedMode,
        version: selectedVersion,
        cases: selectedCases,
        totalCost,
        options: battleOptions
      });
    }
    
    playSound('caseSelect');
  };

  const filteredCases = casesData.filter(caseItem => 
    caseItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => 
    sortOrder === 'LOWEST' ? a.price - b.price : b.price - a.price
  );

  return (
    <div className="bg-[#0a1424] rounded-lg border border-[#1a2c4c] p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-300 hover:text-white transition-colors mr-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to lobby
          </button>
          <div className="flex items-center text-xl font-bold text-white">
            <div className="text-[#00d7a3] mr-2 font-medium">✗</div>
            BATTLES CREATION
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => {
            const caseData = selectedCases[index];
            
            if (caseData) {
              return (
                <div key={`selected-case-${index}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg overflow-hidden p-4">
                  <div className="text-center text-white font-medium mb-2">{caseData.name}</div>
                  <div className="flex justify-center mb-2">
                    <div className="flex items-center">
                      <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-4 h-4 mr-1" />
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

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="flex items-center p-3 rounded-md border border-[#1a2c4c]">
          <span className="text-gray-400 mr-2">☠</span>
          <span className="text-gray-300">CURSED MODE</span>
          <Switch
            checked={battleOptions.cursedMode}
            onCheckedChange={() => handleToggleOption('cursedMode')}
            className="ml-auto"
          />
        </div>
        
        <div className="flex items-center p-3 rounded-md border border-[#1a2c4c]">
          <span className="text-gray-400 mr-2">⚙</span>
          <span className="text-gray-300">TERMINAL MODE</span>
          <Switch
            checked={battleOptions.terminalMode}
            onCheckedChange={() => handleToggleOption('terminalMode')}
            className="ml-auto"
          />
        </div>
        
        <div className="flex items-center p-3 rounded-md border border-[#1a2c4c]">
          <span className="text-gray-300">PRIVATE BATTLE</span>
          <Switch
            checked={battleOptions.privateBattle}
            onCheckedChange={() => handleToggleOption('privateBattle')}
            className="ml-auto"
          />
        </div>
        
        <div className="flex items-center p-3 rounded-md border border-[#1a2c4c]">
          <span className="text-gray-300">AFFILIATES ONLY</span>
          <Switch
            checked={battleOptions.affiliatesOnly}
            onCheckedChange={() => handleToggleOption('affiliatesOnly')}
            className="ml-auto"
          />
        </div>
        
        <div className="flex items-center p-3 rounded-md border border-[#1a2c4c]">
          <span className="text-gray-300">MIN. LEVEL</span>
          <span className="ml-auto font-bold text-white">{battleOptions.minLevel}</span>
        </div>
        
        <div className="flex items-center p-3 rounded-md border border-[#1a2c4c]">
          <span className="text-gray-300">BATTLE FUNDING</span>
          <span className="ml-auto font-bold text-white">{battleOptions.battleFunding}%</span>
        </div>
      </div>

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

export default CaseBattleCreate;
