
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Slider } from '../ui/slider';
import { useToast } from '../ui/use-toast';
import { X, Plus, ArrowRight } from 'lucide-react';

interface Case {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface ImprovedCaseBattleCreatorProps {
  onCreateBattle: (battleData: any) => void;
  onCancel: () => void;
  userBalance: number;
}

const ImprovedCaseBattleCreator: React.FC<ImprovedCaseBattleCreatorProps> = ({ 
  onCreateBattle, 
  onCancel, 
  userBalance
}) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'1v1' | '2v2' | '1v1v1' | '1v1v1v1'>('1v1');
  const [selectedCases, setSelectedCases] = useState<Case[]>([]);
  const [rounds, setRounds] = useState<number>(3);
  
  // Mock cases data
  const availableCases: Case[] = [
    { id: 'case1', name: 'Standard Case', image: '/placeholder.svg', price: 100 },
    { id: 'case2', name: 'Premium Case', image: '/placeholder.svg', price: 500 },
    { id: 'case3', name: 'Battle Case', image: '/placeholder.svg', price: 250 },
    { id: 'case4', name: 'Legends Case', image: '/placeholder.svg', price: 1000 },
  ];
  
  const addCase = (selectedCase: Case) => {
    if (selectedCases.length >= 5) {
      toast({
        title: "Maximum cases reached",
        description: "You can add a maximum of 5 cases to a battle.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedCases([...selectedCases, selectedCase]);
  };
  
  const removeCase = (index: number) => {
    const updatedCases = [...selectedCases];
    updatedCases.splice(index, 1);
    setSelectedCases(updatedCases);
  };
  
  const totalCost = selectedCases.reduce((total, c) => total + c.price, 0);
  
  const handleCreateBattle = () => {
    if (selectedCases.length === 0) {
      toast({
        title: "No cases selected",
        description: "Please select at least one case for the battle.",
        variant: "destructive"
      });
      return;
    }
    
    if (userBalance < totalCost) {
      toast({
        title: "Insufficient balance",
        description: `You need $${totalCost.toFixed(2)} to create this battle.`,
        variant: "destructive"
      });
      return;
    }
    
    onCreateBattle({
      mode,
      cases: selectedCases,
      totalCost
    });
  };
  
  return (
    <Card className="p-6 bg-gray-900 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create a Case Battle</h2>
        <Button variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">
          <X size={20} />
        </Button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Battle Mode</h3>
        <Tabs defaultValue="1v1" onValueChange={(value) => setMode(value as any)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="1v1">1v1</TabsTrigger>
            <TabsTrigger value="2v2">2v2</TabsTrigger>
            <TabsTrigger value="1v1v1">1v1v1</TabsTrigger>
            <TabsTrigger value="1v1v1v1">1v1v1v1</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Select Cases</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableCases.map((c) => (
              <Card 
                key={c.id} 
                className="p-3 bg-gray-800 border border-gray-700 hover:border-blue-600 cursor-pointer transition-all"
                onClick={() => addCase(c)}
              >
                <div className="flex flex-col items-center">
                  <img src={c.image} alt={c.name} className="w-16 h-16 mb-2" />
                  <div className="text-sm font-medium text-center">{c.name}</div>
                  <div className="text-xs text-yellow-400">${c.price.toFixed(2)}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Battle Cases</h3>
          {selectedCases.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center h-[200px] flex items-center justify-center">
              <div className="text-gray-400">
                <Plus size={32} className="mx-auto mb-2" />
                <p>Select cases from the left panel</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              {selectedCases.map((selectedCase, index) => (
                <div key={index} className="flex items-center justify-between mb-2 last:mb-0 p-2 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <img src={selectedCase.image} alt={selectedCase.name} className="w-10 h-10 mr-2" />
                    <div>
                      <div className="text-sm font-medium">{selectedCase.name}</div>
                      <div className="text-xs text-yellow-400">${selectedCase.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeCase(index)} 
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="flex justify-between text-sm mb-1">
                  <span>Your Cost:</span>
                  <span className="font-medium text-yellow-400">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Battle Value:</span>
                  <span className="font-medium text-yellow-400">
                    ${mode === '1v1' ? (totalCost * 2).toFixed(2) : 
                       mode === '2v2' ? (totalCost * 4).toFixed(2) : 
                       mode === '1v1v1' ? (totalCost * 3).toFixed(2) : 
                       (totalCost * 4).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateBattle} 
          className="bg-green-600 hover:bg-green-700"
          disabled={selectedCases.length === 0 || userBalance < totalCost}
        >
          Create Battle <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </Card>
  );
};

export default ImprovedCaseBattleCreator;
