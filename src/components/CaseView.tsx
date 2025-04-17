
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Gem, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import CaseSlider from '@/components/CaseSlider/CaseSlider';
import { SliderItem } from '@/types/slider';

interface CaseItem {
  id: string;
  name: string;
  image: string;
  rarity: string;
  price: number;
  chance: number;
}

interface CaseData {
  id: string;
  name: string;
  image: string;
  price: number;
  backgroundColor: string;
  borderColor: string;
  items: CaseItem[];
}

interface CaseViewProps {
  caseData: CaseData;
  onBack: () => void;
  rarityColors: Record<string, string>;
  rarityBgColors: Record<string, string>;
}

const CaseView: React.FC<CaseViewProps> = ({ 
  caseData, 
  onBack,
  rarityColors,
  rarityBgColors
}) => {
  const { user, updateBalance } = useUser();
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<CaseItem | null>(null);
  
  const sliderItems: SliderItem[] = caseData.items.map(item => ({
    id: item.id,
    name: item.name,
    image: item.image,
    rarity: item.rarity as any,
    price: item.price,
  }));
  
  const handleOpenCase = () => {
    if (!user) {
      toast.error('Please log in to open this case');
      return;
    }
    
    if (user.balance < caseData.price) {
      toast.error(`Insufficient balance. You need ${caseData.price} gems to open this case.`);
      return;
    }
    
    // Deduct the case price from the user's balance
    updateBalance(-caseData.price);
    
    // Determine the outcome based on the chances
    const random = Math.random() * 100;
    let cumulativeChance = 0;
    let selectedItem: CaseItem | null = null;
    
    for (const item of caseData.items) {
      cumulativeChance += item.chance;
      if (random <= cumulativeChance) {
        selectedItem = item;
        break;
      }
    }
    
    if (!selectedItem) {
      selectedItem = caseData.items[caseData.items.length - 1];
    }
    
    setWonItem(selectedItem);
    setIsSpinning(true);
  };
  
  const handleSpinComplete = (item: SliderItem) => {
    setIsSpinning(false);
    
    if (wonItem) {
      // Add the value of the won item to the user's balance
      updateBalance(wonItem.price);
      
      toast.success(`You won: ${wonItem.name}`, {
        description: `Worth ${wonItem.price} gems!`
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-white hover:bg-[#102a43] mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cases
        </Button>
        
        <div className="flex items-center">
          <img 
            src={caseData.image} 
            alt={caseData.name} 
            className="w-12 h-12 mr-3 object-contain"
          />
          <h1 className="text-2xl font-bold text-white">{caseData.name}</h1>
        </div>
        
        <div className="ml-4 flex items-center bg-[#05101d] px-3 py-1 rounded-full">
          <Gem className="h-4 w-4 text-yellow-400 mr-2" />
          <span className="text-yellow-400 font-semibold">{caseData.price.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#0a1929] rounded-lg p-6 border border-[#102a43]">
            <CaseSlider
              items={sliderItems}
              onComplete={handleSpinComplete}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
              autoSpin={false}
              caseName={caseData.name}
            />
            
            <div className="mt-6 flex justify-center">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-6 text-lg"
                onClick={handleOpenCase}
                disabled={isSpinning || !user || (user && user.balance < caseData.price)}
              >
                Open Case
              </Button>
            </div>
            
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map(num => (
                  <div 
                    key={num}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${num === 1 ? 'bg-green-500 text-white' : 'bg-[#102a43] text-gray-400'}`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-[#0a1929] rounded-lg p-6 border border-[#102a43]">
            <h2 className="text-white font-bold mb-4 text-lg">Drop Chances</h2>
            
            <div className="space-y-3">
              {caseData.items.map((item) => (
                <div 
                  key={item.id}
                  className={`${rarityBgColors[item.rarity]} p-3 rounded-lg flex items-center justify-between`}
                >
                  <div className="flex items-center">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-8 h-8 object-contain mr-2"
                    />
                    <div>
                      <div className={`font-medium ${rarityColors[item.rarity]}`}>
                        {item.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-white font-semibold">{item.chance}%</div>
                    <div className="flex items-center text-yellow-400">
                      <Gem className="h-3 w-3 mr-1" />
                      <span>{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseView;
