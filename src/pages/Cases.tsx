
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Gem, ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import CaseView from '../components/CaseView';

const caseTypes = [
  {
    id: 'happy-birthday',
    name: 'Happy Birthday',
    image: '/placeholder.svg',
    price: 29.42,
    backgroundColor: 'bg-gradient-to-b from-pink-700 to-pink-900',
    borderColor: 'border-pink-600',
    items: [
      { id: "1", name: "Party Cap", image: "/placeholder.svg", rarity: "common", price: 10, chance: 80 },
      { id: "2", name: "Party Fedora", image: "/placeholder.svg", rarity: "uncommon", price: 108, chance: 8 },
      { id: "3", name: "Party Unicorn Floatie", image: "/placeholder.svg", rarity: "rare", price: 192, chance: 0.9 },
      { id: "4", name: "2010 Party Cap", image: "/placeholder.svg", rarity: "legendary", price: 5136, chance: 0.1 }
    ]
  },
  {
    id: 'muertos-death',
    name: 'Muertos Death',
    image: '/placeholder.svg',
    price: 33.23,
    backgroundColor: 'bg-gradient-to-b from-purple-700 to-purple-900',
    borderColor: 'border-purple-600',
    items: [
      { id: "5", name: "Skull Mask", image: "/placeholder.svg", rarity: "common", price: 15, chance: 75 },
      { id: "6", name: "Flower Crown", image: "/placeholder.svg", rarity: "uncommon", price: 95, chance: 15 },
      { id: "7", name: "Candle Holder", image: "/placeholder.svg", rarity: "rare", price: 210, chance: 9 },
      { id: "8", name: "Golden Skull", image: "/placeholder.svg", rarity: "legendary", price: 490, chance: 1 }
    ]
  },
  {
    id: 'eggtastic-bombs',
    name: 'Eggtastic Bombs',
    image: '/placeholder.svg',
    price: 66.15,
    backgroundColor: 'bg-gradient-to-b from-yellow-700 to-yellow-900',
    borderColor: 'border-yellow-600',
    items: [
      { id: "9", name: "Easter Egg", image: "/placeholder.svg", rarity: "common", price: 20, chance: 70 },
      { id: "10", name: "Chocolate Bunny", image: "/placeholder.svg", rarity: "uncommon", price: 125, chance: 18 },
      { id: "11", name: "Golden Egg", image: "/placeholder.svg", rarity: "rare", price: 275, chance: 9.5 },
      { id: "12", name: "Diamond Egg", image: "/placeholder.svg", rarity: "legendary", price: 850, chance: 2.5 }
    ]
  },
  {
    id: 'glass-world',
    name: 'Glass World',
    image: '/placeholder.svg',
    price: 88.28,
    backgroundColor: 'bg-gradient-to-b from-indigo-700 to-indigo-900',
    borderColor: 'border-indigo-600',
    items: [
      { id: "13", name: "Crystal Shard", image: "/placeholder.svg", rarity: "common", price: 30, chance: 65 },
      { id: "14", name: "Glass Figurine", image: "/placeholder.svg", rarity: "uncommon", price: 150, chance: 25 },
      { id: "15", name: "Prism Mirror", image: "/placeholder.svg", rarity: "rare", price: 300, chance: 8 },
      { id: "16", name: "Diamond Crystal", image: "/placeholder.svg", rarity: "legendary", price: 1000, chance: 2 }
    ]
  },
  {
    id: 'whats-this',
    name: "What's This",
    image: '/placeholder.svg',
    price: 140.58,
    backgroundColor: 'bg-gradient-to-b from-green-700 to-green-900',
    borderColor: 'border-green-600',
    items: [
      { id: "17", name: "Mystery Box", image: "/placeholder.svg", rarity: "common", price: 50, chance: 60 },
      { id: "18", name: "Unknown Artifact", image: "/placeholder.svg", rarity: "uncommon", price: 200, chance: 25 },
      { id: "19", name: "Strange Device", image: "/placeholder.svg", rarity: "rare", price: 450, chance: 10 },
      { id: "20", name: "Alien Technology", image: "/placeholder.svg", rarity: "legendary", price: 1500, chance: 5 }
    ]
  },
  {
    id: 'dark-magician',
    name: 'Dark Magician',
    image: '/placeholder.svg',
    price: 157.11,
    backgroundColor: 'bg-gradient-to-b from-purple-800 to-purple-950',
    borderColor: 'border-purple-600',
    items: [
      { id: "21", name: "Spell Book", image: "/placeholder.svg", rarity: "common", price: 50, chance: 60 },
      { id: "22", name: "Magic Staff", image: "/placeholder.svg", rarity: "uncommon", price: 200, chance: 25 },
      { id: "23", name: "Enchanted Robe", image: "/placeholder.svg", rarity: "rare", price: 500, chance: 10 },
      { id: "24", name: "Sorcerer's Stone", image: "/placeholder.svg", rarity: "legendary", price: 1800, chance: 5 }
    ]
  },
  {
    id: '5050-brokeboy',
    name: '5050 BrokeBoy',
    image: '/placeholder.svg',
    price: 232.23,
    backgroundColor: 'bg-gradient-to-b from-purple-700 to-purple-900',
    borderColor: 'border-purple-600',
    items: [
      { id: "25", name: "Broken Watch", image: "/placeholder.svg", rarity: "common", price: 60, chance: 50 },
      { id: "26", name: "Golden Watch", image: "/placeholder.svg", rarity: "legendary", price: 2000, chance: 50 }
    ]
  },
  {
    id: 'its-gucci',
    name: "It's Gucci",
    image: '/placeholder.svg',
    price: 328.71,
    backgroundColor: 'bg-gradient-to-b from-amber-800 to-amber-950',
    borderColor: 'border-amber-600',
    items: [
      { id: "27", name: "Designer Belt", image: "/placeholder.svg", rarity: "uncommon", price: 150, chance: 50 },
      { id: "28", name: "Designer Bag", image: "/placeholder.svg", rarity: "rare", price: 300, chance: 35 },
      { id: "29", name: "Designer Shoes", image: "/placeholder.svg", rarity: "epic", price: 700, chance: 10 },
      { id: "30", name: "Limited Edition Set", image: "/placeholder.svg", rarity: "legendary", price: 3500, chance: 5 }
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
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'low' | 'high'>('low');
  
  const filteredCases = caseTypes
    .filter(caseItem => 
      caseItem.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => 
      sortOrder === 'low' 
        ? a.price - b.price 
        : b.price - a.price
    );
  
  const selectedCaseData = selectedCase 
    ? caseTypes.find(c => c.id === selectedCase) 
    : null;
  
  return (
    <div className="bg-[#01111f] min-h-screen">
      <Helmet>
        <title>Cases | DUMP.FUN</title>
      </Helmet>
      
      {selectedCase ? (
        <CaseView 
          caseData={selectedCaseData!} 
          onBack={() => setSelectedCase(null)}
          rarityColors={rarityColors}
          rarityBgColors={rarityBgColors}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="text-white text-2xl font-bold mr-2">LOOT CASES</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="SEARCH FOR CASES..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 bg-[#0a1929] border-[#102a43] text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-gray-400 text-sm">SORT BY:</div>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'low' ? 'high' : 'low')}
                  className="border-[#102a43] bg-[#0a1929] text-white"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {sortOrder === 'low' ? 'LOW' : 'HIGH'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {filteredCases.map((caseItem) => (
              <div 
                key={caseItem.id}
                className="bg-[#0a1929] rounded-lg overflow-hidden border border-[#102a43] hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-lg"
                onClick={() => setSelectedCase(caseItem.id)}
              >
                <div className="p-3">
                  <h3 className="text-white font-bold text-center mb-2">{caseItem.name}</h3>
                  
                  <div className="flex justify-center mb-2">
                    <div className="flex items-center bg-[#05101d] px-2 py-1 rounded-full">
                      <Gem className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-yellow-400 font-semibold">{caseItem.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="h-36 flex items-center justify-center">
                    <img
                      src={caseItem.image}
                      alt={caseItem.name}
                      className="max-h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <Button
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCase(caseItem.id);
                    }}
                  >
                    Open Case
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
