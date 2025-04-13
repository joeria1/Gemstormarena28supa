
import React, { useState } from 'react';
import CaseBattleGame from './CaseBattleGame';
import { toast } from 'sonner';
import { PlusSquare, Users, ArrowLeft, Trash2, Skull, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CaseOption {
  id: string;
  name: string;
  price: number;
  image: string;
}

const mockCases: CaseOption[] = [
  { id: '1', name: 'Happy Birthday', price: 29.42, image: '/placeholder.svg' },
  { id: '2', name: 'Muertos Death', price: 33.23, image: '/placeholder.svg' },
  { id: '3', name: 'Eggtastic Bomb', price: 68.15, image: '/placeholder.svg' },
  { id: '4', name: 'Glass World', price: 99.28, image: '/placeholder.svg' },
  { id: '5', name: 'What\'s This', price: 140.58, image: '/placeholder.svg' },
  { id: '6', name: 'Dark Magician', price: 157.11, image: '/placeholder.svg' },
  { id: '7', name: '5050 BrokeBoy', price: 232.28, image: '/placeholder.svg' },
  { id: '8', name: 'It\'s Gucci', price: 328.71, image: '/placeholder.svg' },
  { id: '9', name: 'Rainbow Heaven', price: 618.63, image: '/placeholder.svg' },
  { id: '10', name: 'Shining Galaxy', price: 961.22, image: '/placeholder.svg' },
];

const EnhancedCaseBattleCreator: React.FC = () => {
  const { user } = useUser();
  const [selectedCases, setSelectedCases] = useState<CaseOption[]>([]);
  const [battleSettings, setBattleSettings] = useState({
    roundsPerPlayer: 1,
    maxPlayers: 4,
    isPrivate: false,
    cursedMode: false,
    battleMode: '1v1'
  });
  const [battleId, setBattleId] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [showBattleCreation, setShowBattleCreation] = useState(false);
  
  const handleAddCase = (caseOption: CaseOption) => {
    setSelectedCases(prev => [...prev, caseOption]);
  };
  
  const handleRemoveCase = (index: number) => {
    setSelectedCases(prev => prev.filter((_, i) => i !== index));
  };
  
  const calculateTotalCost = () => {
    return selectedCases.reduce((total, caseOption) => total + caseOption.price, 0);
  };
  
  const handleCreateBattle = () => {
    if (selectedCases.length === 0) {
      toast.error("Please add at least one case to the battle");
      return;
    }
    
    // Generate a random battle ID
    const newBattleId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setBattleId(newBattleId);
    setShowGame(true);
    toast.success("Battle created successfully!");
  };
  
  const handleCloseGame = () => {
    setShowGame(false);
    setBattleId(null);
    setSelectedCases([]);
    setShowBattleCreation(false);
  };

  const handleToggleBattleCreation = () => {
    setShowBattleCreation(true);
  };

  const handleBattleModeSelect = (mode: string) => {
    setBattleSettings(prev => ({
      ...prev,
      battleMode: mode
    }));
  };

  if (showGame && battleId) {
    return <CaseBattleGame battleId={battleId} onClose={handleCloseGame} cursedMode={battleSettings.cursedMode} />;
  }

  if (showBattleCreation) {
    return (
      <div className="bg-gray-900 text-white min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => setShowBattleCreation(false)}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2">Back to lobby</span>
              </Button>
              <h2 className="text-xl font-bold">BATTLES CREATION</h2>
            </div>
            
            <div className="flex items-center">
              <div className="text-yellow-400 font-bold mr-4">
                Total Cost: <span className="font-mono">{calculateTotalCost().toFixed(2)}</span>
              </div>
              <Button 
                onClick={handleCreateBattle}
                disabled={selectedCases.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                CREATE
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Choose A Mode</h3>
                <div className="grid grid-cols-4 gap-2">
                  <Button 
                    variant={battleSettings.battleMode === '1v1' ? 'default' : 'outline'} 
                    onClick={() => handleBattleModeSelect('1v1')}
                    className={battleSettings.battleMode === '1v1' ? "bg-blue-600" : ""}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    1v1
                  </Button>
                  <Button 
                    variant={battleSettings.battleMode === '1v1v1' ? 'default' : 'outline'} 
                    onClick={() => handleBattleModeSelect('1v1v1')}
                    className={battleSettings.battleMode === '1v1v1' ? "bg-blue-600" : ""}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    1v1v1
                  </Button>
                  <Button 
                    variant={battleSettings.battleMode === '1v1v1v1' ? 'default' : 'outline'} 
                    onClick={() => handleBattleModeSelect('1v1v1v1')}
                    className={battleSettings.battleMode === '1v1v1v1' ? "bg-blue-600" : ""}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    1v1v1v1
                  </Button>
                  <Button 
                    variant={battleSettings.battleMode === '2v2' ? 'default' : 'outline'} 
                    onClick={() => handleBattleModeSelect('2v2')}
                    className={battleSettings.battleMode === '2v2' ? "bg-blue-600" : ""}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    2v2
                  </Button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Choose Version</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="default" className="bg-blue-600">
                    STANDARD
                  </Button>
                  <Button variant="outline">
                    GROUP
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 mb-4">
                <div className="flex items-center gap-2">
                  <Skull className="h-4 w-4 text-red-400" />
                  <Label htmlFor="cursed-mode">Cursed Mode (lowest value wins)</Label>
                </div>
                <Switch
                  id="cursed-mode"
                  checked={battleSettings.cursedMode}
                  onCheckedChange={(checked) => setBattleSettings({...battleSettings, cursedMode: checked})}
                />
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Selected Cases: {selectedCases.length}</h3>
                
                {selectedCases.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCases.map((caseItem, index) => (
                      <div key={index} className="flex justify-between items-center border border-gray-700 rounded p-2 bg-gray-700">
                        <div className="flex items-center">
                          <img src={caseItem.image} alt={caseItem.name} className="w-10 h-10 mr-3" />
                          <div>
                            <p className="font-medium">{caseItem.name}</p>
                            <p className="text-sm text-yellow-400">${caseItem.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveCase(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700 border border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center">
                    <Button variant="outline" className="border-dashed">
                      <PlusSquare className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-3">Available Cases</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mockCases.map(caseOption => (
                  <div 
                    key={caseOption.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => handleAddCase(caseOption)}
                  >
                    <div className="p-4">
                      <div className="text-center mb-2">
                        <div className="flex items-center justify-center mb-1">
                          <img src="/placeholder.svg" alt="Coin" className="w-5 h-5" />
                          <span className="font-bold ml-1">{caseOption.price.toFixed(2)}</span>
                        </div>
                        <h4 className="text-sm font-medium">{caseOption.name}</h4>
                      </div>
                      <img 
                        src={caseOption.image} 
                        alt={caseOption.name} 
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                    <div className="bg-blue-900 p-2 flex justify-center">
                      <Button variant="ghost" size="sm" className="w-full">
                        <PlusSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Create Case Battle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Available Cases</h3>
          <div className="grid grid-cols-2 gap-2">
            {mockCases.slice(0, 4).map(caseOption => (
              <div 
                key={caseOption.id}
                className="border border-gray-700 rounded-lg p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handleAddCase(caseOption)}
              >
                <div className="flex justify-center mb-2">
                  <img src={caseOption.image} alt={caseOption.name} className="w-16 h-16 object-contain" />
                </div>
                <p className="font-medium text-center">{caseOption.name}</p>
                <p className="text-yellow-400 text-center font-bold">{caseOption.price} gems</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Battle Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rounds per Player</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  value={battleSettings.roundsPerPlayer}
                  onChange={(e) => setBattleSettings({...battleSettings, roundsPerPlayer: Number(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Players</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  value={battleSettings.maxPlayers}
                  onChange={(e) => setBattleSettings({...battleSettings, maxPlayers: Number(e.target.value)})}
                >
                  {[2, 3, 4].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="private-battle"
                  checked={battleSettings.isPrivate}
                  onChange={(e) => setBattleSettings({...battleSettings, isPrivate: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="private-battle">Private Battle</label>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Skull className="h-4 w-4 text-red-400" />
                  <Label htmlFor="cursed-mode">Cursed Mode (lowest value wins)</Label>
                </div>
                <Switch
                  id="cursed-mode"
                  checked={battleSettings.cursedMode}
                  onCheckedChange={(checked) => setBattleSettings({...battleSettings, cursedMode: checked})}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Selected Cases</h3>
          {selectedCases.length === 0 ? (
            <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center text-gray-500">
              Click on cases from the left to add them to your battle
            </div>
          ) : (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              {selectedCases.map((caseOption, index) => (
                <div key={index} className="flex items-center justify-between mb-2 p-2 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <img src={caseOption.image} alt={caseOption.name} className="w-10 h-10 object-contain mr-3" />
                    <div>
                      <p className="font-medium">{caseOption.name}</p>
                      <p className="text-sm text-yellow-400">{caseOption.price} gems</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveCase(index)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between font-bold">
                  <span>Total Cost:</span>
                  <span className="text-yellow-400">{calculateTotalCost()} gems</span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleToggleBattleCreation}
            disabled={selectedCases.length === 0}
            className={`w-full mt-6 py-3 rounded-md font-bold ${
              selectedCases.length === 0 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
            } transition-all`}
          >
            Customize Battle
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCaseBattleCreator;
