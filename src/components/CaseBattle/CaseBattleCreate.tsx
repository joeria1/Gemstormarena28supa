
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface Case {
  id: string;
  name: string;
  price: number;
  image: string;
}

// Mock cases data
const availableCases: Case[] = [
  { id: '1', name: 'Happy Birthday', price: 29.92, image: '/placeholder.svg' },
  { id: '2', name: 'Muertos Death', price: 33.23, image: '/placeholder.svg' },
  { id: '3', name: 'Eggtastic Bomb', price: 66.15, image: '/placeholder.svg' },
  { id: '4', name: 'Glass World', price: 99.28, image: '/placeholder.svg' },
  { id: '5', name: 'What\'s This', price: 140.58, image: '/placeholder.svg' },
  { id: '6', name: 'Dark Magician', price: 157.11, image: '/placeholder.svg' },
  { id: '7', name: '5050 BrokeBoy', price: 232.29, image: '/placeholder.svg' },
  { id: '8', name: 'It\'s Gucci', price: 328.71, image: '/placeholder.svg' },
  { id: '9', name: 'Rainbow Heaven', price: 618.83, image: '/placeholder.svg' },
  { id: '10', name: 'Shining Galaxy', price: 961.22, image: '/placeholder.svg' },
];

const CaseBattleCreate: React.FC = () => {
  const [selectedCases, setSelectedCases] = useState<Case[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [roundsPerPlayer, setRoundsPerPlayer] = useState<number>(1);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [totalCost, setTotalCost] = useState<number>(0);
  const { playSound } = useSoundEffect();

  // Calculate total cost when selection changes
  useEffect(() => {
    const cost = selectedCases.reduce((acc, caseItem) => acc + caseItem.price, 0) * playerCount;
    setTotalCost(cost);
  }, [selectedCases, playerCount]);

  // Handle add case to selection
  const handleAddCase = (caseItem: Case) => {
    playSound('caseSelect');
    setSelectedCases([...selectedCases, caseItem]);
  };

  // Handle remove case from selection
  const handleRemoveCase = (id: string) => {
    playSound('caseHover');
    setSelectedCases(selectedCases.filter(c => c.id !== id));
  };

  // Handle player count increment
  const handleIncrementPlayers = () => {
    if (playerCount < 4) {
      setPlayerCount(playerCount + 1);
      playSound('buttonClick');
    } else {
      toast.info('Maximum 4 players allowed');
    }
  };

  // Handle player count decrement
  const handleDecrementPlayers = () => {
    if (playerCount > 2) {
      setPlayerCount(playerCount - 1);
      playSound('buttonClick');
    } else {
      toast.info('Minimum 2 players required');
    }
  };

  // Handle rounds per player increment
  const handleIncrementRounds = () => {
    if (roundsPerPlayer < 5) {
      setRoundsPerPlayer(roundsPerPlayer + 1);
      playSound('buttonClick');
    } else {
      toast.info('Maximum 5 rounds allowed');
    }
  };

  // Handle rounds per player decrement
  const handleDecrementRounds = () => {
    if (roundsPerPlayer > 1) {
      setRoundsPerPlayer(roundsPerPlayer - 1);
      playSound('buttonClick');
    } else {
      toast.info('Minimum 1 round required');
    }
  };

  // Handle battle creation
  const handleCreateBattle = () => {
    if (selectedCases.length === 0) {
      toast.error('Please select at least one case');
      return;
    }

    toast.success('Battle created successfully!');
    playSound('win');
    // Reset form after creation
    setSelectedCases([]);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-6">Create Case Battle</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Case Selection */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger value="all">All Cases</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="high">High Value</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {availableCases.map((caseItem) => (
                  <Card key={caseItem.id} className="bg-gray-900 border-gray-800 hover:border-primary transition-all duration-200">
                    <CardHeader className="p-2 pb-0">
                      <CardTitle className="text-sm font-medium text-white truncate">{caseItem.name}</CardTitle>
                      <p className="text-xs text-green-400">$ {caseItem.price.toFixed(2)}</p>
                    </CardHeader>
                    <CardContent className="p-2 text-center">
                      <img src={caseItem.image} alt={caseItem.name} className="w-full h-32 object-contain mb-2" />
                      <Button 
                        onClick={() => handleAddCase(caseItem)} 
                        variant="ghost"
                        className="w-full text-xs bg-gray-800 hover:bg-primary text-white"
                      >
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="popular" className="mt-4">
              <div className="text-center text-gray-400 py-10">
                Popular cases will appear here
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="mt-4">
              <div className="text-center text-gray-400 py-10">
                New cases will appear here
              </div>
            </TabsContent>
            
            <TabsContent value="high" className="mt-4">
              <div className="text-center text-gray-400 py-10">
                High value cases will appear here
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Section - Battle Configuration */}
        <div>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Battle Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Player Count */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Number of Players</label>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-gray-700 bg-gray-800"
                    onClick={handleDecrementPlayers}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="mx-4 w-14 text-center text-white font-medium">
                    {playerCount}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-gray-700 bg-gray-800"
                    onClick={handleIncrementPlayers}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="ml-4 flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">Players</span>
                  </div>
                </div>
              </div>
              
              {/* Rounds Per Player */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Rounds Per Player</label>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-gray-700 bg-gray-800"
                    onClick={handleDecrementRounds}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="mx-4 w-14 text-center text-white font-medium">
                    {roundsPerPlayer}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-gray-700 bg-gray-800"
                    onClick={handleIncrementRounds}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Private Battle Option */}
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="private-battle" 
                  checked={isPrivate} 
                  onChange={() => setIsPrivate(!isPrivate)}
                  className="rounded border-gray-700 bg-gray-800 text-primary"
                />
                <label htmlFor="private-battle" className="text-sm text-gray-400">Private Battle</label>
              </div>
              
              {/* Total Cost */}
              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Total Cost:</span>
                  <span className="text-green-400 font-bold">${totalCost.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Create Button */}
              <Button 
                onClick={handleCreateBattle} 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={selectedCases.length === 0}
              >
                CREATE
              </Button>
            </CardContent>
          </Card>
          
          {/* Selected Cases */}
          <Card className="bg-gray-900 border-gray-800 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Selected Cases</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCases.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No cases selected yet
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {selectedCases.map((caseItem, index) => (
                    <div 
                      key={`${caseItem.id}-${index}`} 
                      className="flex items-center justify-between p-2 bg-gray-800 rounded-md"
                    >
                      <div className="flex items-center">
                        <img src={caseItem.image} alt={caseItem.name} className="w-10 h-10 object-contain mr-2" />
                        <div>
                          <p className="text-sm text-white truncate max-w-[120px]">{caseItem.name}</p>
                          <p className="text-xs text-green-400">${caseItem.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveCase(caseItem.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaseBattleCreate;
