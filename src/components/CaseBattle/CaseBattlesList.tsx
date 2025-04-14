
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Users, 
  Trophy, 
  Gem, 
  Clock, 
  Lock, 
  Unlock, 
  Eye,
  PercentIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Battle {
  id: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  cases: {
    name: string;
    image: string;
    price: number;
  }[];
  totalValue: number;
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  timestamp: Date;
}

const mockBattles: Battle[] = [
  {
    id: 'battle-1',
    creator: {
      id: 'user-1',
      name: 'CryptoKing',
      avatar: '/placeholder.svg'
    },
    cases: [
      { name: 'Starter Case', image: '/placeholder.svg', price: 50 },
      { name: 'Rare Case', image: '/placeholder.svg', price: 250 }
    ],
    totalValue: 300,
    maxPlayers: 2,
    currentPlayers: 1,
    isPrivate: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  },
  {
    id: 'battle-2',
    creator: {
      id: 'user-2',
      name: 'LuckyGamer',
      avatar: '/placeholder.svg'
    },
    cases: [
      { name: 'Epic Case', image: '/placeholder.svg', price: 500 },
      { name: 'Legendary Case', image: '/placeholder.svg', price: 1000 }
    ],
    totalValue: 1500,
    maxPlayers: 2,
    currentPlayers: 1,
    isPrivate: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
  },
  {
    id: 'battle-3',
    creator: {
      id: 'user-3',
      name: 'CaseMaster',
      avatar: '/placeholder.svg'
    },
    cases: [
      { name: 'Uncommon Case', image: '/placeholder.svg', price: 100 },
      { name: 'Uncommon Case', image: '/placeholder.svg', price: 100 },
      { name: 'Rare Case', image: '/placeholder.svg', price: 250 }
    ],
    totalValue: 450,
    maxPlayers: 3,
    currentPlayers: 2,
    isPrivate: false,
    timestamp: new Date(Date.now() - 1000 * 30) // 30 seconds ago
  }
];

interface CaseBattlesListProps {
  onJoinBattle: (battleId: string) => void;
  onSpectate?: (battleId: string) => void;
  battles?: Battle[]; // Make battles prop optional
}

// Mock item drop chances data for the modal
const mockDropChances = {
  "Starter Case": [
    { name: "Common Item", chance: 70, value: 25, rarity: "common" },
    { name: "Uncommon Item", chance: 20, value: 75, rarity: "uncommon" },
    { name: "Rare Item", chance: 8, value: 150, rarity: "rare" },
    { name: "Epic Item", chance: 1.5, value: 350, rarity: "epic" },
    { name: "Legendary Item", chance: 0.5, value: 1000, rarity: "legendary" }
  ],
  "Rare Case": [
    { name: "Common Item", chance: 40, value: 25, rarity: "common" },
    { name: "Uncommon Item", chance: 30, value: 75, rarity: "uncommon" },
    { name: "Rare Item", chance: 20, value: 150, rarity: "rare" },
    { name: "Epic Item", chance: 8, value: 350, rarity: "epic" },
    { name: "Legendary Item", chance: 2, value: 1000, rarity: "legendary" }
  ],
  "Epic Case": [
    { name: "Uncommon Item", chance: 30, value: 75, rarity: "uncommon" },
    { name: "Rare Item", chance: 40, value: 150, rarity: "rare" },
    { name: "Epic Item", chance: 25, value: 350, rarity: "epic" },
    { name: "Legendary Item", chance: 5, value: 1000, rarity: "legendary" }
  ],
  "Legendary Case": [
    { name: "Rare Item", chance: 35, value: 150, rarity: "rare" },
    { name: "Epic Item", chance: 45, value: 350, rarity: "epic" },
    { name: "Legendary Item", chance: 20, value: 1000, rarity: "legendary" }
  ],
  "Uncommon Case": [
    { name: "Common Item", chance: 55, value: 25, rarity: "common" },
    { name: "Uncommon Item", chance: 35, value: 75, rarity: "uncommon" },
    { name: "Rare Item", chance: 9, value: 150, rarity: "rare" },
    { name: "Epic Item", chance: 1, value: 350, rarity: "epic" }
  ]
};

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

const CaseBattlesList: React.FC<CaseBattlesListProps> = ({ 
  onJoinBattle, 
  onSpectate = () => {}, // Default empty function if not provided
  battles = mockBattles // Use mockBattles as default if not provided
}) => {
  const { user } = useUser();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  const handleJoinBattle = (battle: Battle) => {
    if (!user) {
      toast.error('Please log in to join battles');
      return;
    }
    
    if (battle.isPrivate) {
      toast.error('This battle is private');
      return;
    }
    
    if (battle.currentPlayers >= battle.maxPlayers) {
      toast.error('This battle is already full');
      return;
    }
    
    const costPerPlayer = battle.totalValue / battle.maxPlayers;
    
    if (user.balance < costPerPlayer) {
      toast.error(`You need ${costPerPlayer} gems to join this battle`);
      return;
    }
    
    onJoinBattle(battle.id);
  };

  const handleViewDropChances = (caseName: string) => {
    setSelectedCase(caseName);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Active Battles</h2>
        <div className="text-sm text-gray-400">
          {battles.length} battles available
        </div>
      </div>
      
      <div className="space-y-4">
        {battles.map(battle => (
          <div 
            key={battle.id} 
            className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <div className="flex items-center">
                <img 
                  src={battle.creator.avatar} 
                  alt={battle.creator.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <div className="text-white font-medium">{battle.creator.name}'s Battle</div>
                  <div className="text-gray-400 text-xs flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(battle.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <Users className="h-4 w-4 text-blue-400 mr-1" />
                  <span className="text-white">{battle.currentPlayers}/{battle.maxPlayers}</span>
                </div>
                
                <div className="flex items-center mr-3">
                  <Gem className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 font-medium">{battle.totalValue}</span>
                </div>
                
                {battle.isPrivate ? (
                  <Lock className="h-4 w-4 text-red-400" />
                ) : (
                  <Unlock className="h-4 w-4 text-green-400" />
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  {battle.cases.map((caseItem, index) => (
                    <div 
                      key={index} 
                      className="relative bg-gray-800 border border-gray-700 rounded p-2 w-16"
                    >
                      <img 
                        src={caseItem.image} 
                        alt={caseItem.name}
                        className="w-full h-10 object-contain"
                      />
                      <div className="absolute bottom-0 right-0 bg-gray-900 rounded-tl px-1 text-yellow-400 text-xs flex items-center">
                        <Gem className="h-2 w-2 mr-0.5" />
                        {caseItem.price}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            onClick={() => handleViewDropChances(caseItem.name)}
                            className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-colors"
                          >
                            <Eye className="w-3 h-3 text-white" />
                          </button>
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
                            {mockDropChances[caseItem.name as keyof typeof mockDropChances]?.map((item, i) => (
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
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => onSpectate(battle.id)}
                    className="bg-gray-700 hover:bg-gray-600 flex items-center"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Spectate
                  </Button>
                  
                  <Button
                    onClick={() => handleJoinBattle(battle)}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center"
                    disabled={battle.isPrivate || battle.currentPlayers >= battle.maxPlayers || !user}
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    Join Battle
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 flex justify-between items-center">
                <div>Battle ID: {battle.id}</div>
                <div>
                  Cost to join: <span className="text-yellow-400">{battle.totalValue / battle.maxPlayers} gems</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {battles.length === 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-2">No active battles available</div>
            <div className="text-sm text-gray-500">Create a new battle to get started</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseBattlesList;
