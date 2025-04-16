
import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, User, Bot, Award, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ItemGlowEffect from '../GameEffects/ItemGlowEffect';
import { toast } from 'sonner';
import useSoundEffect from '@/hooks/useSoundEffect';

interface CaseBattleDetailsProps {
  battle: any;
  onClose: () => void;
  onJoin: (battleId: string) => void;
}

const CaseBattleDetails: React.FC<CaseBattleDetailsProps> = ({ battle, onClose, onJoin }) => {
  const [expanded, setExpanded] = useState(false);
  const { playSound } = useSoundEffect();

  const handleJoin = () => {
    playSound('caseSelect');
    onJoin(battle.id);
    toast.success('Joined battle successfully!');
  };

  return (
    <div className="bg-[#0a1424] border border-[#1a2c4c] rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-white mr-2">{battle.name || 'Case Battle'}</h3>
          <Badge variant="outline" className="bg-[#0f2e3b] text-[#00d7a3] border-[#00d7a3]">
            {battle.mode || '2v2'}
          </Badge>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {battle.cases?.map((caseItem: any, idx: number) => (
              <div key={`case-${idx}`} className="relative">
                <img 
                  src={caseItem.image || '/lovable-uploads/d10cbc3f-e87e-4657-b963-ce96a76f4d0d.png'} 
                  alt={caseItem.name || 'Case'} 
                  className="w-12 h-12 object-contain" 
                />
                {caseItem.quantity > 1 && (
                  <div className="absolute -bottom-2 -right-2 bg-[#00d7a3] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {caseItem.quantity}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
            <span className="text-white font-bold">{battle.totalValue?.toFixed(2) || '33.23'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {(battle.players || []).map((player: any, idx: number) => (
          <div key={`player-${idx}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-3">
            {player.name ? (
              <div className="flex items-center">
                <div className="w-8 h-8 overflow-hidden rounded-full border border-[#1a2c4c] mr-2">
                  <img 
                    src={player.avatar || '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png'} 
                    alt={player.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div className="text-white text-sm">{player.name}</div>
                  <div className="flex items-center">
                    <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-3 h-3 mr-1" />
                    <span className="text-xs text-gray-300">{player.balance || 0}</span>
                  </div>
                </div>
                {player.ready && (
                  <div className="ml-auto">
                    <Check className="w-4 h-4 text-[#00d7a3]" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Open Slot</span>
                <Button 
                  onClick={handleJoin}
                  className="bg-[#00d7a3] hover:bg-[#00bf8f] text-white rounded-md px-3 py-1 text-xs"
                >
                  Join
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center text-gray-400 text-sm">
          <User className="w-4 h-4 mr-1" />
          <span>{(battle.players || []).filter((p: any) => p.name && !p.isBot).length}/{battle.maxPlayers || 4} Players</span>
          
          <span className="mx-2">•</span>
          
          <Bot className="w-4 h-4 mr-1" />
          <span>{(battle.players || []).filter((p: any) => p.isBot).length} Bots</span>
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <span className="mr-1">Details</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-[#1a2c4c] pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-gray-400 text-sm mb-2">Possible Rewards</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={`reward-${idx}`} className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-2">
                    <div className="flex justify-center mb-1">
                      <img 
                        src="/lovable-uploads/608591e5-21e8-41f6-bdbc-9955b90772f1.png" 
                        alt="Item" 
                        className="w-10 h-10 object-contain" 
                      />
                    </div>
                    <div className="text-center text-white text-xs">Item #{idx + 1}</div>
                    <div className="flex items-center justify-center mt-1">
                      <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-3 h-3 mr-1" />
                      <span className="text-white text-xs">{(10 + idx * 20).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-gray-400 text-sm mb-2">Battle Details</h4>
              <div className="bg-[#0d1b32] border border-[#1a2c4c] rounded-lg p-3">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">{battle.created || '2 min ago'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Mode</span>
                    <span className="text-white">{battle.mode || '2v2'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Version</span>
                    <span className="text-white">{battle.version || 'STANDARD'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Private</span>
                    <span className="text-white">{battle.private ? 'Yes' : 'No'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-400">Cursed Mode</span>
                    <span className="text-white">{battle.cursedMode ? 'Yes' : 'No'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseBattleDetails;
