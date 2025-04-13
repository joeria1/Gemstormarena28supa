import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gem, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { useSound } from '@/components/SoundManager';
import { preventAutoScroll } from '@/utils/scrollFix';

// Define Battle participant type
export interface BattleParticipant {
  id: string;
  name: string;
  avatar: string;
  isBot?: boolean;
}

// Define Battle type
export interface Battle {
  id: string;
  type: string;
  caseType: string;
  rounds: number;
  cursedMode: boolean;
  creator: BattleParticipant;
  players: BattleParticipant[];
  maxPlayers: number;
  cost: number;
  status: 'waiting' | 'starting' | 'in-progress' | 'completed';
  winner?: BattleParticipant;
  createdAt: Date;
}

// Define case and battle types
type CaseItem = {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  iconUrl: string;
};

type Case = {
  id: string;
  name: string;
  price: number;
  image: string;
  items: CaseItem[];
};

type CaseBattle = {
  id: string;
  creatorId: string;
  cases: Case[];
  participants: BattleParticipant[];
  maxParticipants: number;
  totalValue: number;
  status: 'waiting' | 'in-progress' | 'completed';
  winner?: BattleParticipant;
  createdAt: string;
};

// Sample cases data
const SAMPLE_CASES: Case[] = [
  {
    id: 'case1',
    name: 'Basic Case',
    price: 100,
    image: 'https://via.placeholder.com/150?text=Basic',
    items: [
      { id: 'item1', name: 'Common Gem', rarity: 'common', value: 50, iconUrl: 'https://via.placeholder.com/50/green?text=C' },
      { id: 'item2', name: 'Uncommon Gem', rarity: 'uncommon', value: 150, iconUrl: 'https://via.placeholder.com/50/blue?text=U' },
      { id: 'item3', name: 'Rare Gem', rarity: 'rare', value: 300, iconUrl: 'https://via.placeholder.com/50/purple?text=R' }
    ]
  },
  {
    id: 'case2',
    name: 'Premium Case',
    price: 250,
    image: 'https://via.placeholder.com/150?text=Premium',
    items: [
      { id: 'item4', name: 'Rare Gem', rarity: 'rare', value: 200, iconUrl: 'https://via.placeholder.com/50/purple?text=R' },
      { id: 'item5', name: 'Epic Gem', rarity: 'epic', value: 500, iconUrl: 'https://via.placeholder.com/50/pink?text=E' },
      { id: 'item6', name: 'Legendary Gem', rarity: 'legendary', value: 1000, iconUrl: 'https://via.placeholder.com/50/gold?text=L' }
    ]
  },
  {
    id: 'case3',
    name: 'Luxury Case',
    price: 500,
    image: 'https://via.placeholder.com/150?text=Luxury',
    items: [
      { id: 'item7', name: 'Epic Gem', rarity: 'epic', value: 400, iconUrl: 'https://via.placeholder.com/50/pink?text=E' },
      { id: 'item8', name: 'Legendary Gem', rarity: 'legendary', value: 800, iconUrl: 'https://via.placeholder.com/50/gold?text=L' },
      { id: 'item9', name: 'Mythical Gem', rarity: 'legendary', value: 1500, iconUrl: 'https://via.placeholder.com/50/rainbow?text=M' }
    ]
  }
];

interface CaseBattlesListProps {
  battles: Battle[];
  onJoinBattle: (battleId: string) => void;
  onSpectate: (battleId: string) => void;
}

const CaseBattlesList: React.FC<CaseBattlesListProps> = ({ battles, onJoinBattle, onSpectate }) => {
  const { user, updateBalance } = useUser();
  const { playSound } = useSound();
  const [selectedBattle, setSelectedBattle, ] = useState<CaseBattle | null>(null);

  // Prevent automatic scrolling
  useEffect(() => {
    preventAutoScroll();
  }, []);

  // Fetch battles on mount
  useEffect(() => {
    // Simulate fetching battles from API
    const sampleBattles: CaseBattle[] = [
      {
        id: 'battle1',
        creatorId: 'user1',
        cases: [SAMPLE_CASES[0], SAMPLE_CASES[1]],
        participants: [
          { id: 'user1', name: 'Player1', avatar: 'https://ui-avatars.com/api/?name=Player1', isBot: false, ready: true, rewards: [], totalValue: 0 }
        ],
        maxParticipants: 2,
        totalValue: SAMPLE_CASES[0].price + SAMPLE_CASES[1].price,
        status: 'waiting',
        createdAt: new Date().toISOString()
      },
      {
        id: 'battle2',
        creatorId: 'user2',
        cases: [SAMPLE_CASES[1], SAMPLE_CASES[2]],
        participants: [
          { id: 'user2', name: 'Player2', avatar: 'https://ui-avatars.com/api/?name=Player2', isBot: false, ready: true, rewards: [], totalValue: 0 },
          { id: 'user3', name: 'Player3', avatar: 'https://ui-avatars.com/api/?name=Player3', isBot: false, ready: false, rewards: [], totalValue: 0 }
        ],
        maxParticipants: 2,
        totalValue: SAMPLE_CASES[1].price + SAMPLE_CASES[2].price,
        status: 'waiting',
        createdAt: new Date().toISOString()
      }
    ];
    
    //setBattles(sampleBattles);
  }, []);

  // Join a battle
  const joinBattleFunc = (battleId: string) => {
    if (!user) {
      toast.error('Please login to join battles');
      return;
    }
    
    const battle = battles.find(b => b.id === battleId);
    if (!battle) return;
    
    // Check if battle is full
    if (battle.players.length >= battle.maxPlayers) {
      toast.error('This battle is already full');
      return;
    }
    
    // Check if battle has started
    if (battle.status !== 'waiting') {
      toast.error('This battle has already started');
      return;
    }
    
    // Calculate cost to join
    const costToJoin = battle.cases.reduce((total, c) => total + c.price, 0);
    
    // Check if user has enough balance
    if (user.balance < costToJoin) {
      toast.error(`Insufficient balance. You need ${costToJoin} gems to join.`);
      return;
    }
    
    // Deduct cost from balance
    updateBalance(-costToJoin);
    
    // Add user to participants
    const updatedBattles = [...battles];
    const battleIndex = updatedBattles.findIndex(b => b.id === battleId);
    
    if (battleIndex !== -1) {
      updatedBattles[battleIndex].players.push({
        id: user.id,
        name: user.username,
        avatar: user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username),
        isBot: false,
        
      });
      
      // If battle is full, start it
      //if (updatedBattles[battleIndex].participants.length >= updatedBattles[battleIndex].maxParticipants) {
      //  startBattle(battleId);
      //}
    }
    
    //setBattles(updatedBattles);
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3');
    toast.success(`Joined battle successfully!`);
  };

  // Add a bot to a battle
  const addBot = (battleId: string) => {
    const battle = battles.find(b => b.id === battleId);
    if (!battle) return;
    
    // Check if battle has started
    if (battle.status !== 'waiting') {
      toast.error('This battle has already started');
      return;
    }
    
    // Check if battle is full
    if (battle.players.length >= battle.maxPlayers) {
      toast.error('This battle is already full');
      return;
    }
    
    // Add bot to participants
    const updatedBattles = [...battles];
    const battleIndex = updatedBattles.findIndex(b => b.id === battleId);
    
    if (battleIndex !== -1) {
      const botNames = ['BotAlice', 'BotBob', 'BotCharlie', 'BotDave', 'BotEve'];
      const randomBotName = botNames[Math.floor(Math.random() * botNames.length)];
      
      updatedBattles[battleIndex].players.push({
        id: `bot-${Date.now()}`,
        name: randomBotName,
        avatar: `https://ui-avatars.com/api/?name=${randomBotName}&background=FF5733&color=fff`,
        isBot: true,
        
      });
      
      // If battle is full, start it
      //if (updatedBattles[battleIndex].participants.length >= updatedBattles[battleIndex].maxParticipants) {
      //  startBattle(battleId);
      //}
    }
    
    //setBattles(updatedBattles);
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-arcade-mechanical-bling-210.mp3');
  };

  // Start a battle
  const startBattle = (battleId: string) => {
    const battleIndex = battles.findIndex(b => b.id === battleId);
    if (battleIndex === -1) return;
    
    const battle = battles[battleIndex];
    
    // Update battle status
    const updatedBattles = [...battles];
    //updatedBattles[battleIndex].status = 'in-progress';
    //setBattles(updatedBattles);
    
    // Set selected battle to view
    setSelectedBattle(battle);
    
    // Simulate opening cases
    simulateBattle(battleId);
  };

  // Simulate battle (opening cases)
  const simulateBattle = (battleId: string) => {
    const battleIndex = battles.findIndex(b => b.id === battleId);
    if (battleIndex === -1) return;
    
    const battle = battles[battleIndex];
    
    // Simulate opening each case for each participant
    const updatedBattles = [...battles];
    const updatedBattle = { ...battle };
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-game-level-music-689.mp3');
    
    // Simulate case openings for each case
    updatedBattle.cases.forEach((caseItem, caseIndex) => {
      // Delay to add suspense for each case
      setTimeout(() => {
        // Each participant opens this case
        //updatedBattle.participants.forEach((participant, participantIndex) => {
          // Random item from the case
          //const randomItemIndex = Math.floor(Math.random() * caseItem.items.length);
          //const item = { ...caseItem.items[randomItemIndex] };
          
          // Add slight randomization to value
          //item.value = Math.floor(item.value * (0.8 + Math.random() * 0.4));
          
          // Add reward
          //updatedBattle.participants[participantIndex].rewards.push(item);
          //updatedBattle.participants[participantIndex].totalValue += item.value;
          
          // Update the battle in state
          //updatedBattles[battleIndex] = updatedBattle;
          //setBattles([...updatedBattles]);
          //setSelectedBattle(updatedBattle);
          
          playSound('https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-in-video-game-2058.mp3');
        //});
        
        // If this is the last case, determine winner
        if (caseIndex === updatedBattle.cases.length - 1) {
          setTimeout(() => {
            determineBattleWinner(battleId);
          }, 2000);
        }
      }, 3000 * caseIndex); // Delay each case opening
    });
  };

  // Determine the winner of a battle
  const determineBattleWinner = (battleId: string) => {
    const battleIndex = battles.findIndex(b => b.id === battleId);
    if (battleIndex === -1) return;
    
    const battle = battles[battleIndex];
    
    // Find participant with highest total value
    //let highestValue = -1;
    //let winnerIndex = -1;
    
    //battle.participants.forEach((participant, index) => {
    //  if (participant.totalValue > highestValue) {
    //    highestValue = participant.totalValue;
    //    winnerIndex = index;
    //  }
    //});
    
    // Update battle with winner
    const updatedBattles = [...battles];
    //updatedBattles[battleIndex].winner = battle.participants[winnerIndex];
    //updatedBattles[battleIndex].status = 'completed';
    
    // If real player won, add winnings to balance
    //const winner = battle.participants[winnerIndex];
    //if (!winner.isBot && winner.id === user?.id) {
    //  const totalValue = battle.participants.reduce((total, p) => total + p.totalValue, 0);
    //  updateBalance(totalValue);
      
    //  playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
    //  toast.success(`Congratulations! You won ${totalValue} gems!`);
    //} else if (winner.id === user?.id) {
    //  playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
    //  toast.success(`Congratulations! You won the battle!`);
    //}
    
    //setBattles(updatedBattles);
    //setSelectedBattle(updatedBattles[battleIndex]);
  };

  // Create a new battle
  const createBattle = (caseIds: string[], maxParticipants: number) => {
    if (!user) {
      toast.error('Please login to create battles');
      return;
    }
    
    // Get cases by IDs
    const selectedCases = SAMPLE_CASES.filter(c => caseIds.includes(c.id));
    
    // Calculate total cost
    const totalCost = selectedCases.reduce((total, c) => total + c.price, 0);
    
    // Check if user has enough balance
    if (user.balance < totalCost) {
      toast.error(`Insufficient balance. You need ${totalCost} gems to create this battle.`);
      return;
    }
    
    // Deduct cost from balance
    updateBalance(-totalCost);
    
    // Create new battle
    const newBattle = {
      id: `battle-${Date.now()}`,
      creatorId: user.id,
      cases: selectedCases,
      participants: [
        {
          id: user.id,
          name: user.username,
          avatar: user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username),
          isBot: false,
          ready: true,
          rewards: [],
          totalValue: 0
        }
      ],
      maxParticipants,
      totalValue: totalCost,
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
    
    // Add battle to list
    //setBattles([newBattle, ...battles]);
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-1936.mp3');
    toast.success('Battle created successfully!');
  };

  // Render functions
  const renderBattleCard = (battle: Battle) => {
    const isFull = battle.players.length >= battle.maxPlayers;
    const isUserInBattle = user && battle.players.some(p => p.id === user.id);
    //const isUserCreator = user && battle.creatorId === user.id;
    
    return (
      <Card className="bg-black/40 border border-primary/20 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">
            {battle.caseType}
          </h3>
          <div className="flex items-center">
            <Gem className="h-4 w-4 text-gem mr-1" />
            <span>{battle.cost}</span>
          </div>
        </div>
        
        {/*<div className="grid grid-cols-2 gap-2 mb-4">
          {battle.cases.map((caseItem, index) => (
            <div key={index} className="bg-black/30 rounded p-2 text-center">
              <div className="text-xs text-muted-foreground mb-1">{caseItem.name}</div>
              <div className="flex items-center justify-center text-sm">
                <Gem className="h-3 w-3 text-gem mr-1" />
                <span>{caseItem.price}</span>
              </div>
            </div>
          ))}
        </div>*/}
        
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">Participants ({battle.players.length}/{battle.maxPlayers})</div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: battle.maxPlayers }).map((_, index) => {
              const participant = battle.players[index];
              
              return (
                <div 
                  key={index} 
                  className={`p-2 rounded flex items-center
                    ${participant ? 'bg-primary/20' : 'bg-black/20 border border-dashed border-white/10'}`}
                >
                  {participant ? (
                    <>
                      <img 
                        src={participant.avatar} 
                        alt={participant.name} 
                        className="w-6 h-6 rounded-full mr-2" 
                      />
                      <div className="text-xs truncate">{participant.name}</div>
                      {participant.isBot && <Bot className="h-3 w-3 ml-1 text-orange-400" />}
                    </>
                  ) : (
                    <div className="w-full text-center text-xs text-muted-foreground">
                      Empty Slot
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between">
          {!isFull && battle.status === 'waiting' && !isUserInBattle && (
            <Button 
              onClick={() => onJoinBattle(battle.id)} 
              className="flex-1 mr-1"
              disabled={!user || user.balance < battle.cost}
            >
              Join Battle
            </Button>
          )}
          
          {!isFull && battle.status === 'waiting' && (isUserInBattle) && (
            <Button 
              onClick={() => addBot(battle.id)} 
              variant="outline" 
              className="flex-1 mr-1"
            >
              Add Bot
            </Button>
          )}
          
          {battle.status !== 'waiting' && (
            <Button 
              onClick={() => onSpectate(battle.id)} 
              variant="outline" 
              className="flex-1"
            >
              View Battle
            </Button>
          )}
          
          {isFull && battle.status === 'waiting' && (
            <Button 
              onClick={() => startBattle(battle.id)} 
              className="flex-1"
            >
              Start Battle
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const renderBattleView = (battle: CaseBattle) => {
    return (
      <div className="bg-black/40 border border-primary/20 p-6 rounded-xl backdrop-blur-sm mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Case Battle: {battle.cases.map(c => c.name).join(' + ')}
          </h2>
          <Button 
            variant="outline" 
            onClick={() => setSelectedBattle(null)}
          >
            Back to List
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/*battle.participants.map((participant, index) => (
            <div key={participant.id} className={`p-4 rounded-lg ${participant.id === user?.id ? 'bg-primary/20' : 'bg-black/30'}`}>
              <div className="flex items-center mb-4">
                <img 
                  src={participant.avatar} 
                  alt={participant.name} 
                  className="w-10 h-10 rounded-full mr-3" 
                />
                <div>
                  <div className="font-semibold flex items-center">
                    {participant.name}
                    {participant.isBot && <Bot className="h-4 w-4 ml-1 text-orange-400" />}
                  </div>
                  <div className="flex items-center text-sm">
                    <Gem className="h-3 w-3 text-gem mr-1" />
                    <span>{participant.totalValue}</span>
                  </div>
                </div>
                {battle.winner?.id === participant.id && (
                  <div className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    Winner
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {participant.rewards.length > 0 ? (
                  participant.rewards.map((reward, rewardIndex) => (
                    <div 
                      key={rewardIndex} 
                      className={`p-3 rounded-lg border flex items-center
                        ${reward.rarity === 'common' ? 'border-gray-500 bg-gray-800/30' : 
                          reward.rarity === 'uncommon' ? 'border-blue-500 bg-blue-800/30' : 
                          reward.rarity === 'rare' ? 'border-purple-500 bg-purple-800/30' :
                          reward.rarity === 'epic' ? 'border-pink-500 bg-pink-800/30' :
                          'border-yellow-500 bg-yellow-800/30'}`}
                    >
                      <div className="w-10 h-10 rounded-md bg-black/30 flex items-center justify-center mr-3">
                        <img 
                          src={reward.iconUrl} 
                          alt={reward.name} 
                          className="w-8 h-8" 
                        />
                      </div>
                      <div>
                        <div className="font-medium">{reward.name}</div>
                        <div className="flex items-center text-sm">
                          <Gem className="h-3 w-3 text-gem mr-1" />
                          <span>{reward.value}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {battle.status === 'waiting' ? 'Waiting to start...' : 'Opening cases...'}
                  </div>
                )}
              </div>
            </div>
          ))*/}
        </div>
        
        {battle.status === 'completed' && (
          <div className="text-center mb-6">
            <div className="text-xl font-semibold mb-2">
              Battle Completed
            </div>
            <div className="text-muted-foreground">
              {/*battle.winner?.name*/} won with a total value of {/*battle.winner?.totalValue*/} gems!
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Cases in this Battle</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {battle.cases.map((caseItem, index) => (
              <div key={index} className="bg-black/30 rounded p-3 text-center">
                <div className="font-medium mb-1">{caseItem.name}</div>
                <div className="flex items-center justify-center">
                  <Gem className="h-4 w-4 text-gem mr-1" />
                  <span>{caseItem.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCreateBattle = () => {
    const [selectedCases, setSelectedCases] = useState<string[]>([]);
    const [maxParticipants, setMaxParticipants] = useState(2);
    
    const toggleCaseSelection = (caseId: string) => {
      if (selectedCases.includes(caseId)) {
        setSelectedCases(selectedCases.filter(id => id !== caseId));
      } else {
        setSelectedCases([...selectedCases, caseId]);
      }
    };
    
    const totalCost = SAMPLE_CASES
      .filter(c => selectedCases.includes(c.id))
      .reduce((total, c) => total + c.price, 0);
    
    return (
      <div className="bg-black/40 border border-primary/20 p-6 rounded-xl backdrop-blur-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Battle</h2>
        
        <div className="mb-4">
          <div className="font-medium mb-2">Select Cases</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SAMPLE_CASES.map(caseItem => (
              <div 
                key={caseItem.id}
                className={`p-3 rounded border cursor-pointer transition-colors
                  ${selectedCases.includes(caseItem.id) 
                    ? 'bg-primary/20 border-primary' 
                    : 'bg-black/30 border-white/10 hover:bg-black/40'}`}
                onClick={() => toggleCaseSelection(caseItem.id)}
              >
                <div className="font-medium mb-1">{caseItem.name}</div>
                <div className="flex items-center">
                  <Gem className="h-4 w-4 text-gem mr-1" />
                  <span>{caseItem.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="font-medium mb-2">Number of Participants</div>
          <div className="flex space-x-2">
            {[2, 3, 4].map(num => (
              <div 
                key={num}
                className={`flex-1 py-2 text-center rounded border cursor-pointer transition-colors
                  ${maxParticipants === num 
                    ? 'bg-primary/20 border-primary' 
                    : 'bg-black/30 border-white/10 hover:bg-black/40'}`}
                onClick={() => setMaxParticipants(num)}
              >
                {num} Players
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium">Total Cost:</div>
          <div className="flex items-center text-xl font-bold">
            <Gem className="h-5 w-5 text-gem mr-1" />
            <span>{totalCost}</span>
          </div>
        </div>
        
        <Button 
          onClick={() => createBattle(selectedCases, maxParticipants)} 
          className="w-full"
          disabled={selectedCases.length === 0 || !user || user.balance < totalCost}
        >
          Create Battle
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4">
      {selectedBattle ? (
        renderBattleView(selectedBattle)
      ) : (
        <>
          {renderCreateBattle()}
          
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Active Battles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battles.filter(b => b.status !== 'completed').map(battle => (
                <div key={battle.id}>
                  {renderBattleCard(battle)}
                </div>
              ))}
              
              {battles.filter(b => b.status !== 'completed').length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No active battles. Create one to get started!
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Completed Battles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {battles.filter(b => b.status === 'completed').map(battle => (
                <div key={battle.id}>
                  {renderBattleCard(battle)}
                </div>
              ))}
              
              {battles.filter(b => b.status === 'completed').length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No completed battles yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CaseBattlesList;
