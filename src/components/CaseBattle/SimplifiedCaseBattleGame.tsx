
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useToast } from '../ui/use-toast';
import { useUser } from '../../context/UserContext';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

// Component for spinning effect
const SpinningEffect = ({ children }) => {
  return (
    <div className="animate-spin">
      {children}
    </div>
  );
};

// Component for pulse animation
const PulseAnimation = ({ children }) => {
  return (
    <div className="animate-pulse">
      {children}
    </div>
  );
};

// Types
interface GameCase {
  id: string;
  name: string;
  price: number;
  image: string;
  items: CaseItem[];
}

interface CaseItem {
  id: string;
  name: string;
  rarity: string;
  image: string;
  value: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  ready: boolean;
  totalValue: number;
  items: CaseItem[];
}

interface BattleConfig {
  id: string;
  totalPlayers: number;
  creator: string;
  cases: GameCase[];
  players: Player[];
  status: 'waiting' | 'in-progress' | 'completed';
  winningPlayerId: string | null;
}

// Mock data for cases
const availableCases: GameCase[] = [
  {
    id: '1',
    name: 'Starter Case',
    price: 10,
    image: '/placeholder.svg',
    items: [
      { id: 'item1', name: 'Common Item', rarity: 'common', image: '/placeholder.svg', value: 5 },
      { id: 'item2', name: 'Uncommon Item', rarity: 'uncommon', image: '/placeholder.svg', value: 15 },
      { id: 'item3', name: 'Rare Item', rarity: 'rare', image: '/placeholder.svg', value: 30 }
    ]
  },
  {
    id: '2',
    name: 'Premium Case',
    price: 25,
    image: '/placeholder.svg',
    items: [
      { id: 'item4', name: 'Rare Item', rarity: 'rare', image: '/placeholder.svg', value: 20 },
      { id: 'item5', name: 'Epic Item', rarity: 'epic', image: '/placeholder.svg', value: 50 },
      { id: 'item6', name: 'Legendary Item', rarity: 'legendary', image: '/placeholder.svg', value: 100 }
    ]
  },
  {
    id: '3',
    name: 'Elite Case',
    price: 50,
    image: '/placeholder.svg',
    items: [
      { id: 'item7', name: 'Epic Item', rarity: 'epic', image: '/placeholder.svg', value: 40 },
      { id: 'item8', name: 'Legendary Item', rarity: 'legendary', image: '/placeholder.svg', value: 80 },
      { id: 'item9', name: 'Mythic Item', rarity: 'mythic', image: '/placeholder.svg', value: 200 }
    ]
  },
  {
    id: '4',
    name: 'Ultimate Case',
    price: 100,
    image: '/placeholder.svg',
    items: [
      { id: 'item10', name: 'Legendary Item', rarity: 'legendary', image: '/placeholder.svg', value: 75 },
      { id: 'item11', name: 'Mythic Item', rarity: 'mythic', image: '/placeholder.svg', value: 150 },
      { id: 'item12', name: 'Divine Item', rarity: 'divine', image: '/placeholder.svg', value: 300 }
    ]
  }
];

// Bot names for bot players
const botNames = ['CryptoBot', 'RocketBot', 'LuckyBot', 'MoonBot', 'DiamondBot'];

const SimplifiedCaseBattleGame: React.FC = () => {
  const { toast } = useToast();
  const { user, updateBalance } = useUser();
  
  // State for battle creation
  const [selectedCases, setSelectedCases] = useState<GameCase[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(2);
  const [battlesHistory, setBattlesHistory] = useState<BattleConfig[]>([]);
  const [activeBattle, setActiveBattle] = useState<BattleConfig | null>(null);
  const [isCreatingBattle, setIsCreatingBattle] = useState<boolean>(false);
  const [isJoiningBattle, setIsJoiningBattle] = useState<boolean>(false);
  const [casesToShow, setCasesToShow] = useState<GameCase[]>(availableCases);

  // Slider for case selection (like case slider)
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const [casesPerPage, setCasesPerPage] = useState<number>(2);
  
  // Create battle
  const createBattle = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to create a battle.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedCases.length === 0) {
      toast({
        title: "No Cases Selected",
        description: "You must select at least one case for the battle.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate total cost
    const totalCost = selectedCases.reduce((sum, caseItem) => sum + caseItem.price, 0);
    
    if (user.balance < totalCost) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${totalCost.toFixed(2)} to create this battle.`,
        variant: "destructive",
      });
      return;
    }
    
    // Deduct balance
    updateBalance(-totalCost);
    
    // Create new battle
    const newBattle: BattleConfig = {
      id: Math.random().toString(36).substring(2, 9),
      totalPlayers,
      creator: user.id,
      cases: selectedCases,
      players: [
        {
          id: user.id,
          name: user.username,
          avatar: user.avatar || '/placeholder.svg',
          isBot: false,
          ready: true,
          totalValue: 0,
          items: []
        }
      ],
      status: 'waiting',
      winningPlayerId: null
    };
    
    // Add to battles history
    setBattlesHistory([...battlesHistory, newBattle]);
    setActiveBattle(newBattle);
    setIsCreatingBattle(false);
    setSelectedCases([]);
    
    toast({
      title: "Battle Created",
      description: "Your case battle has been created! Waiting for players to join.",
    });
  };
  
  // Join battle
  const joinBattle = (battle: BattleConfig) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to join a battle.",
        variant: "destructive",
      });
      return;
    }
    
    if (battle.players.some(p => p.id === user.id)) {
      toast({
        title: "Already Joined",
        description: "You are already in this battle.",
        variant: "destructive",
      });
      return;
    }
    
    if (battle.players.length >= battle.totalPlayers) {
      toast({
        title: "Battle Full",
        description: "This battle is already full.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate total cost
    const totalCost = battle.cases.reduce((sum, caseItem) => sum + caseItem.price, 0);
    
    if (user.balance < totalCost) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${totalCost.toFixed(2)} to join this battle.`,
        variant: "destructive",
      });
      return;
    }
    
    // Deduct balance
    updateBalance(-totalCost);
    
    // Add player to battle
    const updatedBattle = { ...battle };
    updatedBattle.players.push({
      id: user.id,
      name: user.username,
      avatar: user.avatar || '/placeholder.svg',
      isBot: false,
      ready: true,
      totalValue: 0,
      items: []
    });
    
    // Update battle
    const updatedBattles = battlesHistory.map(b => 
      b.id === battle.id ? updatedBattle : b
    );
    
    setBattlesHistory(updatedBattles);
    setActiveBattle(updatedBattle);
    
    // Check if battle is ready to start
    if (updatedBattle.players.length === updatedBattle.totalPlayers) {
      startBattle(updatedBattle);
    }
    
    toast({
      title: "Battle Joined",
      description: "You have joined the battle!",
    });
  };
  
  // Add bot to the battle
  const addBot = (battle: BattleConfig) => {
    if (!battle || battle.status !== 'waiting') return;
    
    if (battle.players.length >= battle.totalPlayers) {
      toast({
        title: "Battle Full",
        description: "This battle is already full.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a bot player
    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    const bot: Player = {
      id: `bot-${Math.random().toString(36).substring(2, 9)}`,
      name: botName,
      avatar: '/placeholder.svg',
      isBot: true,
      ready: true,
      totalValue: 0,
      items: []
    };
    
    // Add bot to battle
    const updatedBattle = { ...battle };
    updatedBattle.players.push(bot);
    
    // Update battle
    const updatedBattles = battlesHistory.map(b => 
      b.id === battle.id ? updatedBattle : b
    );
    
    setBattlesHistory(updatedBattles);
    setActiveBattle(updatedBattle);
    
    // Check if battle is ready to start
    if (updatedBattle.players.length === updatedBattle.totalPlayers) {
      startBattle(updatedBattle);
    }
    
    toast({
      title: "Bot Added",
      description: `${botName} has joined the battle!`,
    });
  };
  
  // Start the battle
  const startBattle = (battle: BattleConfig) => {
    // Update battle status
    const updatedBattle = { ...battle, status: 'in-progress' as const };
    
    // Update battles
    const updatedBattles = battlesHistory.map(b => 
      b.id === battle.id ? updatedBattle : b
    );
    
    setBattlesHistory(updatedBattles);
    setActiveBattle(updatedBattle);
    
    // Simulate opening cases for each player
    setTimeout(() => {
      simulateBattleResults(updatedBattle);
    }, 3000);
  };
  
  // Simulate battle results
  const simulateBattleResults = (battle: BattleConfig) => {
    const updatedBattle = { ...battle };
    
    // For each player, simulate opening each case
    updatedBattle.players.forEach(player => {
      let playerItems: CaseItem[] = [];
      let totalValue = 0;
      
      // Open each case
      updatedBattle.cases.forEach(caseItem => {
        // Get a random item from the case
        const randomIndex = Math.floor(Math.random() * caseItem.items.length);
        const wonItem = { ...caseItem.items[randomIndex] };
        
        // Add to player's items
        playerItems.push(wonItem);
        totalValue += wonItem.value;
      });
      
      // Update player's items and total value
      player.items = playerItems;
      player.totalValue = totalValue;
    });
    
    // Determine the winner (player with highest total value)
    const winner = [...updatedBattle.players].sort((a, b) => b.totalValue - a.totalValue)[0];
    updatedBattle.winningPlayerId = winner.id;
    updatedBattle.status = 'completed';
    
    // Update battles
    const updatedBattles = battlesHistory.map(b => 
      b.id === battle.id ? updatedBattle : b
    );
    
    setBattlesHistory(updatedBattles);
    setActiveBattle(updatedBattle);
    
    // Award winnings to winner if it's the user
    if (winner.id === user?.id) {
      // Calculate total item value
      const totalPrizeValue = updatedBattle.players.reduce(
        (sum, player) => sum + player.totalValue, 
        0
      );
      
      updateBalance(totalPrizeValue);
      
      toast({
        title: "You Won!",
        description: `Congratulations! You won $${totalPrizeValue.toFixed(2)} from the battle!`,
      });
    } else {
      toast({
        title: "Battle Completed",
        description: `${winner.name} won the battle.`,
      });
    }
  };
  
  // Case selection methods
  const toggleCaseSelection = (caseItem: GameCase) => {
    if (selectedCases.some(c => c.id === caseItem.id)) {
      // Remove case if already selected
      setSelectedCases(selectedCases.filter(c => c.id !== caseItem.id));
    } else {
      // Add case if not selected
      setSelectedCases([...selectedCases, caseItem]);
    }
  };
  
  // Slider navigation
  const nextSlide = () => {
    if (sliderIndex < availableCases.length - casesPerPage) {
      setSliderIndex(sliderIndex + 1);
    }
  };
  
  const prevSlide = () => {
    if (sliderIndex > 0) {
      setSliderIndex(sliderIndex - 1);
    }
  };
  
  // Update visible cases when slider changes
  useEffect(() => {
    setCasesToShow(availableCases.slice(sliderIndex, sliderIndex + casesPerPage));
  }, [sliderIndex, casesPerPage]);

  // Render case selection
  const renderCaseSelection = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Select Cases for Battle</h2>
        
        <div className="flex justify-between items-center mb-2">
          <Button 
            onClick={prevSlide} 
            disabled={sliderIndex === 0}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="text-sm text-gray-400">
            Cases {sliderIndex + 1} - {Math.min(sliderIndex + casesPerPage, availableCases.length)} of {availableCases.length}
          </div>
          
          <Button 
            onClick={nextSlide} 
            disabled={sliderIndex >= availableCases.length - casesPerPage}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {casesToShow.map(caseItem => (
            <div
              key={caseItem.id}
              className={`
                relative cursor-pointer overflow-hidden rounded-lg
                ${selectedCases.some(c => c.id === caseItem.id) ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => toggleCaseSelection(caseItem)}
            >
              <Card className="bg-gray-800 border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{caseItem.name}</h3>
                    <div className="text-green-400 font-bold">${caseItem.price.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex justify-center py-2">
                    <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center">
                      <img 
                        src={caseItem.image} 
                        alt={caseItem.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="text-sm text-gray-400">Possible Rewards:</div>
                    <div className="flex justify-between space-x-2">
                      {caseItem.items.slice(0, 3).map(item => (
                        <div key={item.id} className="flex-1 bg-gray-700 p-1 rounded text-center">
                          <div className="text-xs" style={{
                            color: 
                              item.rarity === 'common' ? '#aaa' :
                              item.rarity === 'uncommon' ? '#7cb342' :
                              item.rarity === 'rare' ? '#29b6f6' :
                              item.rarity === 'epic' ? '#9c27b0' :
                              item.rarity === 'legendary' ? '#ff9800' :
                              item.rarity === 'mythic' ? '#f44336' : 
                              '#e040fb'
                          }}>
                            ${item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {selectedCases.some(c => c.id === caseItem.id) && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
        
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label className="text-white">Number of Players</Label>
            <div className="flex space-x-2">
              {[2, 3, 4].map(num => (
                <Button
                  key={num}
                  variant={totalPlayers === num ? 'default' : 'outline'}
                  onClick={() => setTotalPlayers(num)}
                  className={`flex-1 ${totalPlayers === num ? 'bg-blue-600' : ''}`}
                >
                  {num} Players
                </Button>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Selected Cases:</span>
              <span className="text-green-400 font-bold">
                Total: ${selectedCases.reduce((sum, c) => sum + c.price, 0).toFixed(2)}
              </span>
            </div>
            
            {selectedCases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedCases.map(c => (
                  <div key={c.id} className="bg-gray-700 px-2 py-1 rounded text-sm flex items-center">
                    {c.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCases(selectedCases.filter(sc => sc.id !== c.id));
                      }}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">No cases selected</div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={createBattle}
              disabled={selectedCases.length === 0 || !user}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Battle
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render active battle
  const renderActiveBattle = () => {
    if (!activeBattle) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {activeBattle.status === 'waiting' ? 'Waiting for Players' : 
             activeBattle.status === 'in-progress' ? 'Battle in Progress' : 
             'Battle Results'}
          </h2>
          
          {activeBattle.status === 'completed' && (
            <Button
              onClick={() => setActiveBattle(null)}
              variant="outline"
            >
              Back to Battles
            </Button>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-400 text-sm">Battle ID:</span>
                <span className="ml-1 text-white">{activeBattle.id}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Status:</span>
                <span className={`ml-1 ${
                  activeBattle.status === 'waiting' ? 'text-yellow-400' :
                  activeBattle.status === 'in-progress' ? 'text-blue-400' :
                  'text-green-400'
                }`}>
                  {activeBattle.status.charAt(0).toUpperCase() + activeBattle.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-white font-bold mb-2">Cases:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {activeBattle.cases.map(caseItem => (
                <div key={caseItem.id} className="bg-gray-700 p-2 rounded flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded mr-2 flex items-center justify-center">
                    <img 
                      src={caseItem.image} 
                      alt={caseItem.name}
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-white text-sm">{caseItem.name}</div>
                    <div className="text-green-400 text-xs">${caseItem.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <h3 className="text-white font-bold mb-2">Players: {activeBattle.players.length}/{activeBattle.totalPlayers}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: activeBattle.totalPlayers }).map((_, index) => {
                const player = activeBattle.players[index];
                
                if (!player) {
                  // Render empty slot
                  return (
                    <div key={`empty-${index}`} className="bg-gray-700 rounded-lg p-4 border border-dashed border-gray-600 flex items-center justify-center">
                      <span className="text-gray-500">Waiting for player...</span>
                    </div>
                  );
                }
                
                const isWinner = activeBattle.status === 'completed' && activeBattle.winningPlayerId === player.id;
                
                return (
                  <div 
                    key={player.id} 
                    className={`
                      bg-gray-700 rounded-lg p-4 relative overflow-hidden
                      ${isWinner ? 'ring-2 ring-yellow-500' : ''}
                    `}
                  >
                    {isWinner && (
                      <div className="absolute top-0 right-0 bg-yellow-500 text-black px-2 py-1 text-xs font-bold">
                        WINNER
                      </div>
                    )}
                    
                    <div className="flex items-center mb-3">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white">{player.name}</div>
                        <div className="text-gray-400 text-xs">{player.isBot ? 'Bot' : 'Player'}</div>
                      </div>
                      
                      {activeBattle.status === 'completed' && (
                        <div className="ml-auto text-green-400 font-bold">
                          ${player.totalValue.toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    {activeBattle.status !== 'waiting' && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400">Items:</div>
                        
                        {activeBattle.status === 'in-progress' ? (
                          <div className="flex justify-center">
                            <div className="animate-spin">
                              <div className="w-12 h-12 bg-gray-600 rounded"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {player.items.map((item, itemIndex) => (
                              <div 
                                key={`${player.id}-item-${itemIndex}`} 
                                className={`
                                  p-1 rounded-sm text-xs w-14
                                  ${item.rarity === 'common' ? 'bg-gray-600 text-white' :
                                    item.rarity === 'uncommon' ? 'bg-green-900 text-green-300' :
                                    item.rarity === 'rare' ? 'bg-blue-900 text-blue-300' :
                                    item.rarity === 'epic' ? 'bg-purple-900 text-purple-300' :
                                    item.rarity === 'legendary' ? 'bg-yellow-900 text-yellow-300' :
                                    item.rarity === 'mythic' ? 'bg-red-900 text-red-300' :
                                    'bg-pink-900 text-pink-300'}
                                `}
                              >
                                <div className="text-center">${item.value}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {activeBattle.status === 'waiting' && activeBattle.creator === user?.id && (
              <div className="mt-4">
                <Button
                  onClick={() => addBot(activeBattle)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Add Bot
                </Button>
              </div>
            )}
            
            {activeBattle.status === 'waiting' && 
             !activeBattle.players.some(p => p.id === user?.id) && 
             activeBattle.players.length < activeBattle.totalPlayers && (
              <div className="mt-4">
                <Button
                  onClick={() => joinBattle(activeBattle)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Join Battle (${activeBattle.cases.reduce((sum, c) => sum + c.price, 0).toFixed(2)})
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Render battles list
  const renderBattlesList = () => {
    const availableBattles = battlesHistory.filter(battle => 
      battle.status === 'waiting' && 
      battle.players.length < battle.totalPlayers &&
      !battle.players.some(p => p.id === user?.id)
    );
    
    const userBattles = battlesHistory.filter(battle => 
      battle.players.some(p => p.id === user?.id)
    );
    
    return (
      <div className="space-y-6">
        {availableBattles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Available Battles</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {availableBattles.map(battle => (
                <Card key={battle.id} className="bg-gray-800 border-gray-700">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="text-white font-bold">
                          {battle.players[0].name}'s Battle
                        </h3>
                        <div className="text-gray-400 text-xs">
                          Players: {battle.players.length}/{battle.totalPlayers}
                        </div>
                      </div>
                      <div className="text-green-400 font-bold">
                        ${battle.cases.reduce((sum, c) => sum + c.price, 0).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      {battle.cases.map(caseItem => (
                        <div key={caseItem.id} className="bg-gray-700 rounded p-1 flex items-center">
                          <div className="w-6 h-6 bg-gray-600 rounded-sm mr-1"></div>
                          <span className="text-white text-xs">{caseItem.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => joinBattle(battle)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Join Battle
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {userBattles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Your Battles</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {userBattles.map(battle => (
                <Card key={battle.id} className="bg-gray-800 border-gray-700">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="text-white font-bold">
                          {battle.players[0].name}'s Battle
                        </h3>
                        <div className="text-gray-400 text-xs">
                          Status: {battle.status.charAt(0).toUpperCase() + battle.status.slice(1)}
                        </div>
                      </div>
                      
                      {battle.status === 'completed' && battle.winningPlayerId === user?.id && (
                        <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                          WON
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      {battle.cases.map(caseItem => (
                        <div key={caseItem.id} className="bg-gray-700 rounded p-1 flex items-center">
                          <div className="w-6 h-6 bg-gray-600 rounded-sm mr-1"></div>
                          <span className="text-white text-xs">{caseItem.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-1 mb-3">
                      {battle.players.map(player => (
                        <div key={player.id} className="flex-1 bg-gray-700 p-2 rounded text-center">
                          <Avatar className="h-6 w-6 mx-auto mb-1">
                            <AvatarImage src={player.avatar} />
                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-white text-xs truncate">{player.name}</div>
                          
                          {battle.status === 'completed' && (
                            <div className="text-green-400 text-xs font-bold">
                              ${player.totalValue.toFixed(2)}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {Array(battle.totalPlayers - battle.players.length).fill(0).map((_, idx) => (
                        <div key={`empty-${idx}`} className="flex-1 bg-gray-700 p-2 rounded text-center border border-dashed border-gray-600">
                          <div className="text-gray-500 text-xs">Empty</div>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => setActiveBattle(battle)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main component render
  return (
    <div className="space-y-6">
      {/* Top action buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Case Battles</h1>
        
        <div className="space-x-2">
          {isCreatingBattle ? (
            <Button 
              onClick={() => setIsCreatingBattle(false)} 
              variant="outline"
            >
              Cancel
            </Button>
          ) : (
            <Button 
              onClick={() => {
                setIsCreatingBattle(true);
                setActiveBattle(null);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Battle
            </Button>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      {isCreatingBattle ? (
        renderCaseSelection()
      ) : activeBattle ? (
        renderActiveBattle()
      ) : (
        renderBattlesList()
      )}
    </div>
  );
};

export default SimplifiedCaseBattleGame;
