
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, X, ChevronLeft, Plus, User, Users, Bot, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CaseBattleDetails from './CaseBattleDetails';
import CaseBattleCreate from './CaseBattleCreate';
import CaseBattleGame from './EnhancedCaseBattleGame';
import useSoundEffect from '@/hooks/useSoundEffect';
import { toast } from 'sonner';

// Mock battle data
const battlesMock = [
  {
    id: '1',
    name: 'High Rollers',
    mode: '2v2',
    cases: [
      { id: 1, name: 'Muertos Death', price: 33.23, image: '/lovable-uploads/d10cbc3f-e87e-4657-b963-ce96a76f4d0d.png', quantity: 1 }
    ],
    totalValue: 33.23,
    players: [
      { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 100, team: 0, ready: true },
      { id: 2, name: '', avatar: '', balance: 0, team: 0, ready: false },
      { id: 3, name: '', avatar: '', balance: 0, team: 1, ready: false },
      { id: 4, name: '', avatar: '', balance: 0, team: 1, ready: false }
    ],
    created: '2 min ago',
    maxPlayers: 4,
    private: false,
    cursedMode: false,
    version: 'STANDARD'
  },
  {
    id: '2',
    name: 'Skull Squad',
    mode: '1v1',
    cases: [
      { id: 2, name: 'Happy Birthday', price: 29.92, image: '/lovable-uploads/bb236c40-d9ac-4887-8448-f955d662b8bc.png', quantity: 2 }
    ],
    totalValue: 59.84,
    players: [
      { id: 1, name: 'BinLaden', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 200, team: 0, ready: false },
      { id: 2, name: '', avatar: '', balance: 0, team: 1, ready: false }
    ],
    created: '5 min ago',
    maxPlayers: 2,
    private: true,
    cursedMode: true,
    version: 'STANDARD'
  }
];

const CaseBattlesList = () => {
  const [battles, setBattles] = useState(battlesMock);
  const [selectedBattle, setSelectedBattle] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'details' | 'create' | 'game'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedBattles, setExpandedBattles] = useState<string[]>([]);
  const { playSound } = useSoundEffect();

  const handleBattleSelect = (battleId: string) => {
    setSelectedBattle(battleId);
    setView('details');
    playSound('caseSelect');
  };

  const handleToggleExpand = (battleId: string) => {
    setExpandedBattles(prev => 
      prev.includes(battleId) 
        ? prev.filter(id => id !== battleId)
        : [...prev, battleId]
    );
    playSound('caseSelect');
  };

  const handleCreateBattle = () => {
    setView('create');
    playSound('caseSelect');
  };

  const handleJoinBattle = (battleId: string) => {
    setSelectedBattle(battleId);
    setView('game');
    playSound('caseSelect');
    toast.success('Joined battle successfully!');
  };

  const handleSaveBattle = (battleData: any) => {
    const newBattle = {
      id: (battles.length + 1).toString(),
      name: 'New Battle',
      mode: battleData.mode,
      cases: battleData.cases,
      totalValue: battleData.totalCost,
      players: [
        { id: 1, name: 'Truster8845', avatar: '/lovable-uploads/8dac7154-820f-4299-a28e-7c2a37d4e863.png', balance: 100, team: 0, ready: true },
        { id: 2, name: '', avatar: '', balance: 0, team: 0, ready: false },
        { id: 3, name: '', avatar: '', balance: 0, team: 1, ready: false },
        { id: 4, name: '', avatar: '', balance: 0, team: 1, ready: false }
      ],
      created: 'Just now',
      maxPlayers: battleData.mode === '2v2' ? 4 : (
        battleData.mode === '1v1v1v1' ? 4 : (
          battleData.mode === '1v1v1' ? 3 : 2
        )
      ),
      private: battleData.options.privateBattle,
      cursedMode: battleData.options.cursedMode,
      version: battleData.version
    };
    
    setBattles([newBattle, ...battles]);
    setSelectedBattle(newBattle.id);
    setView('game');
    toast.success('Battle created successfully!');
  };

  const renderBattlesList = () => {
    const filteredBattles = battles.filter(battle => {
      const matchesSearch = battle.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || 
                         (activeTab === 'my' && battle.players.some(p => p.name === 'Truster8845')) ||
                         (activeTab === 'highvalue' && battle.totalValue > 50);
      return matchesSearch && matchesTab;
    });
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Case Battles</h2>
          <Button 
            onClick={handleCreateBattle}
            className="bg-[#00d7a3] hover:bg-[#00bf8f] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Battle
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-[#0d1b32] border border-[#1a2c4c]">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-[#0f2e3b] data-[state=active]:text-[#00d7a3] data-[state=active]:border-[#00d7a3]"
              >
                All Battles
              </TabsTrigger>
              <TabsTrigger 
                value="my" 
                className="data-[state=active]:bg-[#0f2e3b] data-[state=active]:text-[#00d7a3] data-[state=active]:border-[#00d7a3]"
              >
                My Battles
              </TabsTrigger>
              <TabsTrigger 
                value="highvalue" 
                className="data-[state=active]:bg-[#0f2e3b] data-[state=active]:text-[#00d7a3] data-[state=active]:border-[#00d7a3]"
              >
                High Value
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search battles..." 
              className="w-64 bg-[#0d1b32] border border-[#1a2c4c] rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#00d7a3]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredBattles.length > 0 ? (
            filteredBattles.map(battle => (
              <div 
                key={battle.id} 
                className="bg-[#0a1424] border border-[#1a2c4c] rounded-lg overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-[#0d1b32] transition-colors"
                  onClick={() => handleBattleSelect(battle.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <h3 className="text-xl font-bold text-white mr-2">{battle.name}</h3>
                      <Badge variant="outline" className="bg-[#0f2e3b] text-[#00d7a3] border-[#00d7a3]">
                        {battle.mode}
                      </Badge>
                      {battle.private && (
                        <Badge variant="outline" className="ml-2 bg-[#241f31] text-[#e66100] border-[#e66100]">
                          PRIVATE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-5 h-5 mr-1" />
                        <span className="text-white font-bold">{battle.totalValue.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleExpand(battle.id);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        {expandedBattles.includes(battle.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <div className="flex -space-x-2 mr-4">
                      {battle.players.filter(p => p.name).map((player, idx) => (
                        <div 
                          key={`player-${battle.id}-${idx}`} 
                          className="w-8 h-8 rounded-full border-2 border-[#0a1424] overflow-hidden"
                        >
                          <img 
                            src={player.avatar} 
                            alt={player.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))}
                      {Array.from({ length: battle.maxPlayers - battle.players.filter(p => p.name).length }).map((_, idx) => (
                        <div 
                          key={`empty-player-${battle.id}-${idx}`} 
                          className="w-8 h-8 rounded-full bg-[#0d1b32] border-2 border-[#0a1424] flex items-center justify-center"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {battle.players.filter(p => p.name).length}/{battle.maxPlayers} Players
                    </span>
                    
                    <Separator orientation="vertical" className="mx-3 h-4 bg-[#1a2c4c]" />
                    
                    <span className="text-gray-400 text-sm">{battle.created}</span>
                  </div>
                </div>
                
                {expandedBattles.includes(battle.id) && (
                  <div className="p-4 border-t border-[#1a2c4c] bg-[#0d1b32]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-gray-400 text-sm mb-2">Cases</h4>
                        <div className="flex flex-wrap gap-2">
                          {battle.cases.map((caseItem, idx) => (
                            <div 
                              key={`case-${battle.id}-${idx}`} 
                              className="bg-[#0a1424] border border-[#1a2c4c] rounded-lg p-2 flex items-center"
                            >
                              <img 
                                src={caseItem.image} 
                                alt={caseItem.name} 
                                className="w-10 h-10 object-contain mr-2" 
                              />
                              <div>
                                <div className="text-white text-sm">{caseItem.name}</div>
                                <div className="flex items-center">
                                  <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-3 h-3 mr-1" />
                                  <span className="text-gray-300 text-xs">{caseItem.price.toFixed(2)}</span>
                                </div>
                              </div>
                              {caseItem.quantity > 1 && (
                                <div className="ml-2 bg-[#1a2c4c] text-white text-xs px-2 py-1 rounded">
                                  x{caseItem.quantity}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-gray-400 text-sm mb-2">Players</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {battle.players.map((player, idx) => (
                            <div 
                              key={`player-detail-${battle.id}-${idx}`} 
                              className="bg-[#0a1424] border border-[#1a2c4c] rounded-lg p-2"
                            >
                              {player.name ? (
                                <div className="flex items-center">
                                  <div className="w-8 h-8 overflow-hidden rounded-full border border-[#1a2c4c] mr-2">
                                    <img 
                                      src={player.avatar} 
                                      alt={player.name} 
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                  <div>
                                    <div className="text-white text-sm">{player.name}</div>
                                    <div className="flex items-center">
                                      <img src="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png" alt="Coin" className="w-3 h-3 mr-1" />
                                      <span className="text-gray-300 text-xs">{player.balance}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400 text-sm">Empty Slot</span>
                                  <Button 
                                    onClick={() => handleJoinBattle(battle.id)}
                                    className="bg-[#00d7a3] hover:bg-[#00bf8f] text-white rounded-md px-3 py-1 text-xs"
                                    size="sm"
                                  >
                                    Join
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-gray-400 text-sm mb-2">Battle Settings</h4>
                        <div className="bg-[#0a1424] border border-[#1a2c4c] rounded-lg p-3">
                          <ul className="space-y-2">
                            <li className="flex justify-between">
                              <span className="text-gray-400">Mode</span>
                              <span className="text-white">{battle.mode}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-400">Version</span>
                              <span className="text-white">{battle.version}</span>
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
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        onClick={() => handleJoinBattle(battle.id)}
                        className="bg-[#00d7a3] hover:bg-[#00bf8f] text-white"
                      >
                        Join Battle
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#0a1424] border border-[#1a2c4c] rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">No battles found</div>
              <Button 
                onClick={handleCreateBattle}
                className="bg-[#00d7a3] hover:bg-[#00bf8f] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create a Battle
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'details':
        const battle = battles.find(b => b.id === selectedBattle);
        return battle ? (
          <CaseBattleDetails 
            battle={battle} 
            onClose={() => setView('list')} 
            onJoin={handleJoinBattle}
          />
        ) : (
          <div>Battle not found</div>
        );
        
      case 'create':
        return (
          <CaseBattleCreate 
            onBack={() => setView('list')} 
            onCreateBattle={handleSaveBattle}
          />
        );
        
      case 'game':
        const selectedBattleData = battles.find(b => b.id === selectedBattle);
        return (
          <CaseBattleGame 
            players={selectedBattleData?.players}
            cases={selectedBattleData?.cases}
            mode={selectedBattleData?.mode}
            onBack={() => setView('list')}
            onRecreate={() => setView('list')}
          />
        );
        
      case 'list':
      default:
        return renderBattlesList();
    }
  };

  return (
    <div className="container mx-auto py-8">
      {renderContent()}
    </div>
  );
};

export default CaseBattlesList;
