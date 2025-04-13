
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Plus, Minus, X, Sword, DollarSign, ChevronLeft, Users, Package } from 'lucide-react';
import { toast } from 'sonner';

interface CaseItem {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface ImprovedCaseBattleCreatorProps {
  onCreateBattle: (battleDetails: any) => void;
  onCancel: () => void;
  userBalance: number;
}

const battleModes = [
  { id: '1v1', label: '1v1', players: 2 },
  { id: '1v1v1', label: '1v1v1', players: 3 },
  { id: '1v1v1v1', label: '1v1v1v1', players: 4 },
  { id: '2v2', label: '2v2', players: 4 },
];

const versionTypes = [
  { id: 'standard', label: 'STANDARD', icon: 'vs' },
  { id: 'group', label: 'GROUP', icon: 'groups' },
];

const casesData: CaseItem[] = [
  { id: '1', name: 'Starter Case', image: '/placeholder.svg', price: 5.00 },
  { id: '2', name: 'Premium Case', image: '/placeholder.svg', price: 10.00 },
  { id: '3', name: 'Gold Case', image: '/placeholder.svg', price: 25.00 },
  { id: '4', name: 'Diamond Case', image: '/placeholder.svg', price: 50.00 },
  { id: '5', name: 'Platinum Case', image: '/placeholder.svg', price: 100.00 },
];

const ImprovedCaseBattleCreator: React.FC<ImprovedCaseBattleCreatorProps> = ({ 
  onCreateBattle, 
  onCancel,
  userBalance 
}) => {
  const [selectedMode, setSelectedMode] = useState<string>('1v1');
  const [selectedVersion, setSelectedVersion] = useState<string>('standard');
  const [selectedCases, setSelectedCases] = useState<CaseItem[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  
  useEffect(() => {
    // Calculate total cost based on selected cases
    const cost = selectedCases.reduce((sum, item) => sum + item.price, 0);
    setTotalCost(cost);
  }, [selectedCases]);
  
  const handleSelectMode = (mode: string) => {
    setSelectedMode(mode);
  };
  
  const handleSelectVersion = (version: string) => {
    setSelectedVersion(version);
  };
  
  const handleAddCase = (caseItem: CaseItem) => {
    setSelectedCases([...selectedCases, caseItem]);
  };
  
  const handleRemoveCase = (index: number) => {
    const updatedCases = [...selectedCases];
    updatedCases.splice(index, 1);
    setSelectedCases(updatedCases);
  };
  
  const handleCreateBattle = () => {
    if (selectedCases.length === 0) {
      toast.error('Please select at least one case');
      return;
    }
    
    if (totalCost > userBalance) {
      toast.error('Insufficient balance');
      return;
    }
    
    onCreateBattle({
      mode: selectedMode,
      version: selectedVersion,
      cases: selectedCases,
      totalCost
    });
  };
  
  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white"
            onClick={onCancel}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to lobby
          </Button>
          
          <div className="flex items-center">
            <Sword className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="font-bold text-white text-lg">BATTLES CREATION</h2>
          </div>
          
          <div className="flex items-center">
            <p className="text-gray-400 mr-2">Total Cost</p>
            <div className="flex items-center text-yellow-500 font-bold">
              <DollarSign className="h-4 w-4" />
              <span>{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="font-bold text-white mb-3">Choose A Mode</h3>
              <div className="grid grid-cols-4 gap-3">
                {battleModes.map(mode => (
                  <Button
                    key={mode.id}
                    variant={selectedMode === mode.id ? 'default' : 'outline'}
                    className={`h-16 ${
                      selectedMode === mode.id 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-gray-700 text-white hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelectMode(mode.id)}
                  >
                    <div className="flex flex-col items-center">
                      <Users className="h-5 w-5 mb-1" />
                      <span className="text-sm">{mode.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold text-white mb-3">Choose Version</h3>
              <div className="grid grid-cols-2 gap-3">
                {versionTypes.map(version => (
                  <Button
                    key={version.id}
                    variant={selectedVersion === version.id ? 'default' : 'outline'}
                    className={`h-16 ${
                      selectedVersion === version.id 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-gray-700 text-white hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelectVersion(version.id)}
                  >
                    <div className="w-full flex justify-between items-center">
                      <div className="bg-gray-800 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold">
                        {version.icon}
                      </div>
                      <span className="text-sm font-bold">{version.label}</span>
                      <div className="w-8"></div> {/* Spacer for alignment */}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-3">Select Cases</h3>
              <Tabs defaultValue="all">
                <TabsList className="w-full bg-gray-800 mb-4">
                  <TabsTrigger value="all" className="flex-1">All Cases</TabsTrigger>
                  <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                  <TabsTrigger value="new" className="flex-1">New</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {casesData.map(caseItem => (
                      <Card 
                        key={caseItem.id}
                        className="bg-gray-800 border-none p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleAddCase(caseItem)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{caseItem.name}</h4>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-gray-900 rounded-md p-2 flex items-center justify-center h-32">
                          <img 
                            src={caseItem.image} 
                            alt={caseItem.name}
                            className="h-full w-auto object-contain"
                          />
                        </div>
                        <div className="flex justify-end mt-2">
                          <div className="bg-gray-900 px-2 py-1 rounded text-yellow-500 font-bold flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {caseItem.price.toFixed(2)}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="popular">
                  <div className="text-center py-6 text-gray-400">
                    Popular cases will appear here
                  </div>
                </TabsContent>
                
                <TabsContent value="new">
                  <div className="text-center py-6 text-gray-400">
                    New cases will appear here
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div>
            <Card className="bg-gray-900 border-none shadow h-full overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-bold text-white">Battle Summary</h3>
              </div>
              
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Mode:</span>
                  <span className="font-bold">{selectedMode}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Version:</span>
                  <span className="font-bold capitalize">{selectedVersion}</span>
                </div>
                
                <Separator className="bg-gray-800 my-4" />
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Selected Cases:</span>
                    <span className="font-bold">{selectedCases.length}</span>
                  </div>
                  
                  <div className="bg-gray-800 rounded-md p-3 max-h-64 overflow-y-auto">
                    {selectedCases.length > 0 ? (
                      selectedCases.map((caseItem, index) => (
                        <div 
                          key={`${caseItem.id}-${index}`} 
                          className="flex items-center justify-between mb-2 last:mb-0"
                        >
                          <div className="flex items-center">
                            <div className="bg-gray-900 h-8 w-8 rounded flex items-center justify-center overflow-hidden mr-2">
                              <img 
                                src={caseItem.image} 
                                alt={caseItem.name}
                                className="h-full w-auto object-contain"
                              />
                            </div>
                            <span className="text-sm truncate max-w-[120px]">{caseItem.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-yellow-500 font-bold text-sm mr-2">
                              ${caseItem.price.toFixed(2)}
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                              onClick={() => handleRemoveCase(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No cases selected</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="bg-gray-800 my-4" />
                
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-400">Total Cost:</span>
                  <div className="flex items-center text-yellow-500 font-bold">
                    <DollarSign className="h-4 w-4" />
                    <span>{totalCost.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={handleCreateBattle}
                    disabled={selectedCases.length === 0 || totalCost > userBalance}
                  >
                    CREATE
                  </Button>
                  
                  {totalCost > userBalance && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      Insufficient balance
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCaseBattleCreator;
