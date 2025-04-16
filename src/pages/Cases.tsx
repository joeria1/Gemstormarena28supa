import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import ImprovedCaseBattleCreator from '../components/CaseBattle/ImprovedCaseBattleCreator';
import CaseBattlesList from '../components/CaseBattle/CaseBattlesList';
import ImprovedCaseBattleGame from '../components/CaseBattle/ImprovedCaseBattleGame';
import { Eye, Gem, PercentIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const caseTypes = [
  {
    id: 'case-1',
    name: 'Starter Case',
    image: '/placeholder.svg',
    price: 50,
    backgroundColor: 'bg-gradient-to-b from-gray-700 to-gray-900',
    borderColor: 'border-gray-600',
    items: [
      { name: "Common Item", chance: 70, value: 25, rarity: "common" },
      { name: "Uncommon Item", chance: 20, value: 75, rarity: "uncommon" },
      { name: "Rare Item", chance: 8, value: 150, rarity: "rare" },
      { name: "Epic Item", chance: 1.5, value: 350, rarity: "epic" },
      { name: "Legendary Item", chance: 0.5, value: 1000, rarity: "legendary" }
    ]
  },
  {
    id: 'case-2',
    name: 'Uncommon Case',
    image: '/placeholder.svg',
    price: 100,
    backgroundColor: 'bg-gradient-to-b from-green-800 to-green-950',
    borderColor: 'border-green-600',
    items: [
      { name: "Common Item", chance: 55, value: 25, rarity: "common" },
      { name: "Uncommon Item", chance: 35, value: 75, rarity: "uncommon" },
      { name: "Rare Item", chance: 9, value: 150, rarity: "rare" },
      { name: "Epic Item", chance: 1, value: 350, rarity: "epic" }
    ]
  },
  {
    id: 'case-3',
    name: 'Rare Case',
    image: '/placeholder.svg',
    price: 250,
    backgroundColor: 'bg-gradient-to-b from-blue-800 to-blue-950',
    borderColor: 'border-blue-600',
    items: [
      { name: "Common Item", chance: 40, value: 25, rarity: "common" },
      { name: "Uncommon Item", chance: 30, value: 75, rarity: "uncommon" },
      { name: "Rare Item", chance: 20, value: 150, rarity: "rare" },
      { name: "Epic Item", chance: 8, value: 350, rarity: "epic" },
      { name: "Legendary Item", chance: 2, value: 1000, rarity: "legendary" }
    ]
  },
  {
    id: 'case-4',
    name: 'Epic Case',
    image: '/placeholder.svg',
    price: 500,
    backgroundColor: 'bg-gradient-to-b from-purple-800 to-purple-950',
    borderColor: 'border-purple-600',
    items: [
      { name: "Uncommon Item", chance: 30, value: 75, rarity: "uncommon" },
      { name: "Rare Item", chance: 40, value: 150, rarity: "rare" },
      { name: "Epic Item", chance: 25, value: 350, rarity: "epic" },
      { name: "Legendary Item", chance: 5, value: 1000, rarity: "legendary" }
    ]
  },
  {
    id: 'case-5',
    name: 'Legendary Case',
    image: '/placeholder.svg',
    price: 1000,
    backgroundColor: 'bg-gradient-to-b from-amber-800 to-amber-950',
    borderColor: 'border-amber-600',
    items: [
      { name: "Rare Item", chance: 35, value: 150, rarity: "rare" },
      { name: "Epic Item", chance: 45, value: 350, rarity: "epic" },
      { name: "Legendary Item", chance: 20, value: 1000, rarity: "legendary" }
    ]
  }
];

const rarityColors = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400'
};

const rarityBgColors = {
  common: 'bg-gray-800',
  uncommon: 'bg-green-900',
  rare: 'bg-blue-900',
  epic: 'bg-purple-900',
  legendary: 'bg-amber-900'
};

const Cases = () => {
  const { user, updateBalance } = useUser();
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  
  const handleCreateBattle = (battleSettings: any) => {
    const newBattleId = `battle-${Math.floor(Math.random() * 10000)}`;
    setActiveBattleId(newBattleId);
  };
  
  const handleJoinBattle = (battleId: string) => {
    setActiveBattleId(battleId);
  };
  
  const handleCloseBattle = () => {
    setActiveBattleId(null);
  };

  const handleOpenCase = (caseId: string) => {
    const selectedCase = caseTypes.find(c => c.id === caseId);
    
    if (!selectedCase) return;
    
    if (!user) {
      toast.error('Please log in to open cases');
      return;
    }
    
    if (user.balance < selectedCase.price) {
      toast.error(`Insufficient balance to open this case. You need ${selectedCase.price} gems.`);
      return;
    }
    
    updateBalance(-selectedCase.price);
    
    const random = Math.random() * 100;
    let cumulativeChance = 0;
    let wonItem = selectedCase.items[0];
    
    for (const item of selectedCase.items) {
      cumulativeChance += item.chance;
      if (random < cumulativeChance) {
        wonItem = item;
        break;
      }
    }
    
    updateBalance(wonItem.value);
    
    toast.success(`You won: ${wonItem.name}`, {
      description: `Worth ${wonItem.value} gems!`
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Case Battles | DUMP.FUN</title>
      </Helmet>
      
      {activeBattleId ? (
        <ImprovedCaseBattleGame 
          battleId={activeBattleId}
          onClose={handleCloseBattle}
        />
      ) : (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Cases</h1>
            <p className="text-gray-400 mt-2">Open cases to win valuable items or create battles with other players!</p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Available Cases</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {caseTypes.map(caseItem => (
                  <div 
                    key={caseItem.id} 
                    className={`${caseItem.backgroundColor} ${caseItem.borderColor} border-2 rounded-lg overflow-hidden shadow-lg transition duration-300 hover:scale-105`}
                  >
                    <div className="p-4 flex flex-col items-center">
                      <img 
                        src={caseItem.image} 
                        alt={caseItem.name}
                        className="w-full h-32 object-contain mb-4"
                      />
                      <h3 className="text-xl font-bold text-white text-center">{caseItem.name}</h3>
                    </div>
                    
                    <div className="bg-black bg-opacity-50 p-4 flex flex-col gap-3">
                      <div className="flex justify-center items-center">
                        <Gem className="h-5 w-5 text-yellow-400 mr-2" />
                        <span className="text-lg font-bold text-yellow-400">{caseItem.price}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full bg-blue-900/50 border-blue-700 hover:bg-blue-800"
                              onClick={() => setSelectedCase(caseItem.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Drop Chances
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-700 text-white">
                            <DialogHeader>
                              <DialogTitle className="flex items-center justify-center text-xl">
                                <span className="mr-2">{caseItem.name}</span>
                                <PercentIcon className="h-4 w-4 text-blue-400" />
                                <span className="ml-2">Drop Chances</span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="flex justify-between items-center mb-2 px-2 text-sm font-semibold">
                                <span>Item</span>
                                <span>Chance</span>
                                <span>Value</span>
                              </div>
                              {caseItem.items.map((item, i) => (
                                <div 
                                  key={i} 
                                  className={`${rarityBgColors[item.rarity as keyof typeof rarityBgColors]} rounded-lg p-3 flex justify-between items-center`}
                                >
                                  <span className={`${rarityColors[item.rarity as keyof typeof rarityColors]} font-medium`}>
                                    {item.name}
                                  </span>
                                  <span className="text-white font-semibold">{item.chance}%</span>
                                  <span className="text-yellow-400 flex items-center">
                                    <Gem className="h-3 w-3 mr-1" />
                                    {item.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <Button 
                        onClick={() => handleOpenCase(caseItem.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={!user || (user && user.balance < caseItem.price)}
                      >
                        Open Case
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <ImprovedCaseBattleCreator onCreateBattle={handleCreateBattle} />
            <CaseBattlesList />
          </div>
        </>
      )}
    </div>
  );
};

export default Cases;
