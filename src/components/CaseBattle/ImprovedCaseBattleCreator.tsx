import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Gem, Plus, Minus, Bot, Info } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Case {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: string;
  quantity?: number;
  dropRates?: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

const availableCases: Case[] = [
  { id: '1', name: 'Starter Case', price: 50, image: '/placeholder.svg', rarity: 'common' },
  { id: '2', name: 'Uncommon Case', price: 100, image: '/placeholder.svg', rarity: 'uncommon' },
  { id: '3', name: 'Rare Case', price: 250, image: '/placeholder.svg', rarity: 'rare' },
  { id: '4', name: 'Epic Case', price: 500, image: '/placeholder.svg', rarity: 'epic' },
  { id: '5', name: 'Legendary Case', price: 1000, image: '/placeholder.svg', rarity: 'legendary' }
];

interface ImprovedCaseBattleCreatorProps {
  onCreateBattle: (battleSettings: any) => void;
}

const ImprovedCaseBattleCreator: React.FC<ImprovedCaseBattleCreatorProps> = ({ onCreateBattle }) => {
  const { user } = useUser();
  const [selectedCases, setSelectedCases] = useState<Case[]>([]);
  const [playersCount, setPlayersCount] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMode, setSelectedMode] = useState('1v1');
  const [dropRatesDialogOpen, setDropRatesDialogOpen] = useState(false);
  const [selectedCaseForRates, setSelectedCaseForRates] = useState<Case | null>(null);
  
  const totalCost = selectedCases.reduce((sum, c) => sum + c.price, 0);
  
  const getMaxPlayers = () => {
    switch (selectedMode) {
      case '1v1': return 2;
      case '1v1v1': return 3;
      case '1v1v1v1': return 4;
      case '2v2': return 4;
      default: return 2;
    }
  };
  
  const getEmptySlots = () => {
    const maxPlayers = getMaxPlayers();
    return maxPlayers - (user ? 1 : 0);
  };
  
  const handleAddCase = (caseItem: Case) => {
    if (selectedCases.length >= 5) {
      toast.error("Maximum 5 cases per battle");
      return;
    }
    
    setSelectedCases(prev => [...prev, {...caseItem, quantity: 1}]);
  };
  
  const handleQuantityChange = (index: number, change: number) => {
    setSelectedCases(prev => {
      if ((prev[index].quantity || 1) === 1 && change === -1) {
        return prev.filter((_, i) => i !== index);
      }
      
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: Math.max(1, (updated[index].quantity || 1) + change)
      };
      return updated;
    });
  };

  const handleCreateBattle = () => {
    if (selectedCases.length === 0) {
      toast.error("Please select at least one case");
      return;
    }
    
    if (!user) {
      toast.error("Please log in to create a battle");
      return;
    }
    
    if (user.balance < totalCost) {
      toast.error("Insufficient balance to create this battle");
      return;
    }
    
    const battleSettings = {
      cases: selectedCases,
      mode: selectedMode,
      players: getMaxPlayers(),
      private: isPrivate,
      totalCost
    };
    
    onCreateBattle(battleSettings);
    toast.success("Battle created successfully!");
  };

  const showDropRates = (caseItem: Case) => {
    setSelectedCaseForRates(caseItem);
    setDropRatesDialogOpen(true);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Create a Case Battle</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-300 mb-2">Battle Mode</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['1v1', '1v1v1', '1v1v1v1', '2v2'].map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-4 py-2 rounded-md ${
                selectedMode === mode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-300 mb-2">Select Cases</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {availableCases.map(caseItem => (
            <div
              key={caseItem.id}
              className="bg-gray-900 border border-gray-700 rounded-lg p-2 hover:border-gray-600 transition-colors"
            >
              <div className="text-center">
                <div className="relative">
                  <img src={caseItem.image} alt={caseItem.name} className="w-full h-20 object-contain mb-2" />
                  <button
                    onClick={() => showDropRates(caseItem)}
                    className="absolute top-0 right-0 p-1 bg-gray-800 rounded-bl-lg"
                  >
                    <Info className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="text-white text-sm font-medium">{caseItem.name}</div>
                <div className="flex justify-center items-center mt-1">
                  <Gem className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-sm">{caseItem.price}</span>
                </div>
                <button
                  onClick={() => handleAddCase(caseItem)}
                  className="mt-2 w-full px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Add to Battle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-300 mb-2">Your Battle</h3>
        
        {selectedCases.length > 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {selectedCases.map((caseItem, index) => (
                <div key={index} className="relative">
                  <div className="bg-gray-800 border border-gray-700 rounded p-2">
                    <img src={caseItem.image} alt={caseItem.name} className="w-full h-12 object-contain mb-1" />
                    <div className="text-xs text-center text-white">{caseItem.name}</div>
                    <div className="flex justify-center items-center mt-1">
                      <Gem className="h-3 w-3 text-yellow-400 mr-1" />
                      <span className="text-yellow-400 text-xs">{caseItem.price}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <button 
                        onClick={() => handleQuantityChange(index, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-[#1a2c4c] rounded text-white hover:bg-[#253e64] transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-medium">{caseItem.quantity || 1}</span>
                      <button 
                        onClick={() => handleQuantityChange(index, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-[#1a2c4c] rounded text-white hover:bg-[#253e64] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {Array(5 - selectedCases.length).fill(0).map((_, index) => (
                <div key={`empty-${index}`} className="border border-dashed border-gray-700 rounded p-2 flex items-center justify-center h-24">
                  <Plus className="h-4 w-4 text-gray-600" />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-300">Slots to Fill: {getEmptySlots()}</span>
                {getEmptySlots() > 0 && (
                  <button 
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Bot className="w-4 h-4 mr-1" />
                    Add Bot
                  </button>
                )}
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-300 mr-2">Total Cost:</span>
                <span className="flex items-center text-yellow-400 font-bold">
                  <Gem className="h-4 w-4 mr-1 text-yellow-400" />
                  {totalCost}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateBattle}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
              disabled={!user || user.balance < totalCost}
            >
              Create Battle
            </Button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
            <div className="text-gray-400 mb-2">Select cases to create your battle</div>
            <div className="text-sm text-gray-500">Cases will appear here</div>
          </div>
        )}
      </div>

      <Dialog open={dropRatesDialogOpen} onOpenChange={setDropRatesDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Drop Rates - {selectedCaseForRates?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">
              View possible items and their drop rates
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-3">Possible Items</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Common</span>
                  <span className="text-blue-400">40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-300">Uncommon</span>
                  <span className="text-blue-400">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Rare</span>
                  <span className="text-blue-400">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-300">Epic</span>
                  <span className="text-blue-400">8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-300">Legendary</span>
                  <span className="text-blue-400">2%</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setDropRatesDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImprovedCaseBattleCreator;
