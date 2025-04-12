import React, { useState, useEffect } from "react";
import CaseSlider from "@/components/CaseSlider/CaseSlider";
import { SliderItem, CaseSelection } from "@/types/slider";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { useSound } from "@/components/SoundManager";
import { 
  Button, 
} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Bot, 
  Check,
  ChevronRight,
  CircleX,
  Gem, 
  Loader2, 
  Minus,
  PlusCircle, 
  Shield, 
  ShieldAlert, 
  Sword, 
  Trophy, 
  Users,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Sample cases with different types and price ranges
const availableCases = [
  {
    id: 'basic',
    name: 'Basic Case',
    price: 300,
    image: '/placeholder.svg',
    items: [
      { id: '1', name: 'Common Sword', image: '/placeholder.svg', rarity: 'common' as const, price: 100 },
      { id: '2', name: 'Forest Shield', image: '/placeholder.svg', rarity: 'uncommon' as const, price: 250 },
      { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare' as const, price: 500 },
      { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic' as const, price: 1000 },
    ]
  },
  {
    id: 'premium',
    name: 'Premium Case',
    price: 500,
    image: '/placeholder.svg',
    items: [
      { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare' as const, price: 500 },
      { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic' as const, price: 1000 },
      { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary' as const, price: 2500 },
      { id: '9', name: 'Mystic Staff', image: '/placeholder.svg', rarity: 'rare' as const, price: 500 },
    ]
  },
  {
    id: 'legendary',
    name: 'Legendary Case',
    price: 1000,
    image: '/placeholder.svg',
    items: [
      { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary' as const, price: 2500 },
      { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
      { id: '10', name: 'Shadow Cloak', image: '/placeholder.svg', rarity: 'epic' as const, price: 1000 },
    ]
  },
  {
    id: 'mythical',
    name: 'Mythical Case',
    price: 2000,
    image: '/placeholder.svg',
    items: [
      { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
      { id: '11', name: 'Eternal Flame', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
      { id: '12', name: 'Cosmic Shard', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
    ]
  },
  {
    id: 'divine',
    name: 'Divine Case',
    price: 5000,
    image: '/placeholder.svg',
    items: [
      { id: '13', name: 'Celestial Crown', image: '/placeholder.svg', rarity: 'mythical' as const, price: 10000 },
      { id: '14', name: 'Divine Scepter', image: '/placeholder.svg', rarity: 'mythical' as const, price: 12000 },
      { id: '15', name: 'Immortal Heart', image: '/placeholder.svg', rarity: 'mythical' as const, price: 15000 },
    ]
  },
  {
    id: 'cursed',
    name: 'Cursed Case',
    price: 666,
    image: '/placeholder.svg',
    items: [
      { id: '16', name: 'Unholy Blade', image: '/placeholder.svg', rarity: 'legendary' as const, price: 2500 },
      { id: '17', name: 'Corrupted Orb', image: '/placeholder.svg', rarity: 'epic' as const, price: 1000 },
      { id: '18', name: 'Demon Skull', image: '/placeholder.svg', rarity: 'mythical' as const, price: 5000 },
    ]
  },
];

// Default items for the slider
const defaultItems: SliderItem[] = [
  { id: '1', name: 'Common Sword', image: '/placeholder.svg', rarity: 'common', price: 100 },
  { id: '2', name: 'Forest Shield', image: '/placeholder.svg', rarity: 'uncommon', price: 250 },
  { id: '3', name: 'Ocean Blade', image: '/placeholder.svg', rarity: 'rare', price: 500 },
  { id: '4', name: 'Thunder Axe', image: '/placeholder.svg', rarity: 'epic', price: 1000 },
  { id: '5', name: 'Dragon Slayer', image: '/placeholder.svg', rarity: 'legendary', price: 2500 },
  { id: '6', name: 'Void Reaver', image: '/placeholder.svg', rarity: 'mythical', price: 5000 },
];

type BattleMode = 'solo' | '1v1' | '2v2' | '4-player';

interface Participant {
  id: string;
  name: string;
  isBot: boolean;
  items: {caseId: string, item: SliderItem | null}[];
  isSpinning: boolean;
  displaySlider: boolean;
  avatar?: string;
  team?: number;
  totalValue: number;
}

interface Battle {
  id: string;
  cases: CaseSelection[];
  mode: BattleMode;
  participants: Participant[];
  status: 'waiting' | 'active' | 'completed';
  winner: string | null;
  winningTeam?: number;
  totalValue: number;
  startTime: number;
  currentCaseIndex: number;
  allCasesSpun: boolean;
}

const Index = () => {
  const { user, updateBalance } = useUser();
  const { playSound, isMuted, toggleMute } = useSound();
  const [selectedCases, setSelectedCases] = useState<CaseSelection[]>([
    { caseId: availableCases[0].id, quantity: 1 }
  ]);
  const [lastWon, setLastWon] = useState<SliderItem | null>(null);
  const [mode, setMode] = useState<BattleMode>('solo');
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [activeCase, setActiveCase] = useState<string>(availableCases[0].id);
  
  // Calculate total cost of selected cases
  const calculateTotalCost = () => {
    return selectedCases.reduce((total, selection) => {
      const caseItem = availableCases.find(c => c.id === selection.caseId);
      return total + (caseItem ? caseItem.price * selection.quantity : 0);
    }, 0);
  };
  
  // Add a case to the selection
  const addCase = () => {
    setSelectedCases([
      ...selectedCases,
      { caseId: availableCases[0].id, quantity: 1 }
    ]);
  };
  
  // Remove a case from the selection
  const removeCase = (index: number) => {
    if (selectedCases.length > 1) {
      const newSelection = [...selectedCases];
      newSelection.splice(index, 1);
      setSelectedCases(newSelection);
    }
  };
  
  // Update a case selection
  const updateCaseSelection = (index: number, caseId: string) => {
    const newSelection = [...selectedCases];
    newSelection[index] = { ...newSelection[index], caseId };
    setSelectedCases(newSelection);
  };
  
  // Update a case quantity
  const updateCaseQuantity = (index: number, quantity: number) => {
    if (quantity > 0 && quantity <= 5) {
      const newSelection = [...selectedCases];
      newSelection[index] = { ...newSelection[index], quantity };
      setSelectedCases(newSelection);
    }
  };
  
  // Open a case directly (not in battle mode)
  const openCase = () => {
    if (!user) {
      toast.error("Please login to open a case");
      return;
    }
    
    const selectedCase = availableCases.find(c => c.id === activeCase);
    
    if (!selectedCase) {
      toast.error("Invalid case selection");
      return;
    }
    
    if (user.balance < selectedCase.price) {
      toast.error(`Insufficient balance. You need ${selectedCase.price} gems to open this case`);
      return;
    }
    
    // Deduct the cost of the case
    updateBalance(-selectedCase.price);
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3');
    toast.success(`Opening ${selectedCase.name}...`);
    
    // We would implement direct case opening UI here
  };
  
  // Create a new battle
  const createBattle = () => {
    if (!user) {
      toast.error("Please login to create a battle");
      return;
    }
    
    const totalCost = calculateTotalCost();
    
    if (user.balance < totalCost) {
      toast.error(`Insufficient balance. You need ${totalCost} gems to start a battle`);
      return;
    }
    
    // Deduct the cost of the cases from the user's balance
    updateBalance(-totalCost);
    
    const battleId = `battle-${Date.now()}`;
    
    // Initialize participants based on the mode
    let initialParticipants: Participant[] = [];
    
    // Setup for the user participant with empty item slots for each case
    const userParticipant: Participant = {
      id: user.id,
      name: user.username,
      isBot: false,
      items: selectedCases.map(selection => ({
        caseId: selection.caseId,
        item: null
      })),
      isSpinning: false,
      displaySlider: false,
      avatar: user.avatar,
      team: mode === '2v2' ? 1 : undefined,
      totalValue: 0
    };
    
    initialParticipants.push(userParticipant);
    
    // Add other participants based on selected mode
    if (mode === '1v1') {
      initialParticipants.push({
        id: 'bot-1',
        name: 'Bot 1',
        isBot: true,
        items: selectedCases.map(selection => ({
          caseId: selection.caseId,
          item: null
        })),
        isSpinning: false,
        displaySlider: false,
        totalValue: 0
      });
    } else if (mode === '2v2') {
      initialParticipants.push(
        {
          id: 'teammate',
          name: 'Teammate',
          isBot: true,
          items: selectedCases.map(selection => ({
            caseId: selection.caseId,
            item: null
          })),
          isSpinning: false,
          displaySlider: false,
          team: 1,
          totalValue: 0
        },
        {
          id: 'bot-1',
          name: 'Opponent 1',
          isBot: true,
          items: selectedCases.map(selection => ({
            caseId: selection.caseId,
            item: null
          })),
          isSpinning: false,
          displaySlider: false,
          team: 2,
          totalValue: 0
        },
        {
          id: 'bot-2',
          name: 'Opponent 2',
          isBot: true,
          items: selectedCases.map(selection => ({
            caseId: selection.caseId,
            item: null
          })),
          isSpinning: false,
          displaySlider: false,
          team: 2,
          totalValue: 0
        }
      );
    } else if (mode === '4-player') {
      initialParticipants.push(
        {
          id: 'bot-1',
          name: 'Player 2',
          isBot: true,
          items: selectedCases.map(selection => ({
            caseId: selection.caseId,
            item: null
          })),
          isSpinning: false,
          displaySlider: false,
          totalValue: 0
        },
        {
          id: 'bot-2',
          name: 'Player 3',
          isBot: true,
          items: selectedCases.map(selection => ({
            caseId: selection.caseId,
            item: null
          })),
          isSpinning: false,
          displaySlider: false,
          totalValue: 0
        },
        {
          id: 'bot-3',
          name: 'Player 4',
          isBot: true,
          items: selectedCases.map(selection => ({
            caseId: selection.caseId,
            item: null
          })),
          isSpinning: false,
          displaySlider: false,
          totalValue: 0
        }
      );
    }
    
    // Create the new battle
    const newBattle: Battle = {
      id: battleId,
      cases: [...selectedCases],
      mode: mode,
      participants: initialParticipants,
      status: 'waiting',
      winner: null,
      totalValue: 0,
      startTime: Date.now(),
      currentCaseIndex: 0,
      allCasesSpun: false
    };
    
    setBattles(prev => [...prev, newBattle]);
    setSelectedBattle(newBattle);
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-magic-sweep-game-trophy-257.mp3');
    toast.success("Battle created! Get ready to open cases.");
    
    // Start the battle after a short delay
    setTimeout(() => {
      startBattle(newBattle.id);
    }, 500);
  };
  
  // Start the battle
  const startBattle = (battleId: string) => {
    setBattles(prev => 
      prev.map(battle => {
        if (battle.id === battleId) {
          return {
            ...battle,
            status: 'active',
            participants: battle.participants.map(p => ({
              ...p,
              isSpinning: true,
              displaySlider: true
            }))
          };
        }
        return battle;
      })
    );
    
    // Update selected battle if needed
    if (selectedBattle?.id === battleId) {
      setSelectedBattle(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'active',
          participants: prev.participants.map(p => ({
            ...p,
            isSpinning: true,
            displaySlider: true
          }))
        };
      });
    }
    
    // Play a sound to indicate the start of the battle
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-game-level-completed-2059.mp3');
  };
  
  // Move to the next case in the battle
  const moveToNextCase = (battleId: string) => {
    setBattles(prev => 
      prev.map(battle => {
        if (battle.id === battleId) {
          const nextIndex = battle.currentCaseIndex + 1;
          const allCasesCompleted = nextIndex >= battle.cases.length;
          
          if (allCasesCompleted) {
            // All cases have been opened, determine the winner
            return determineWinner({...battle, currentCaseIndex: battle.currentCaseIndex, allCasesSpun: true});
          }
          
          // Move to the next case
          return {
            ...battle,
            currentCaseIndex: nextIndex,
            participants: battle.participants.map(p => ({
              ...p,
              isSpinning: true,
              displaySlider: true
            }))
          };
        }
        return battle;
      })
    );
    
    // Update selected battle if needed
    if (selectedBattle?.id === battleId) {
      setSelectedBattle(prev => {
        if (!prev) return null;
        
        const nextIndex = prev.currentCaseIndex + 1;
        const allCasesCompleted = nextIndex >= prev.cases.length;
        
        if (allCasesCompleted) {
          // All cases have been opened, determine the winner
          return determineWinner({...prev, currentCaseIndex: prev.currentCaseIndex, allCasesSpun: true});
        }
        
        // Move to the next case
        return {
          ...prev,
          currentCaseIndex: nextIndex,
          participants: prev.participants.map(p => ({
            ...p,
            isSpinning: true,
            displaySlider: true
          }))
        };
      });
    }
    
    // Play a sound to indicate moving to the next case
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-video-game-retro-click-1114.mp3', 0.3);
  };
  
  // Determine the winner of the battle
  const determineWinner = (battle: Battle): Battle => {
    let updatedBattle = {...battle, status: 'completed' as const, allCasesSpun: true};
    
    // Calculate the total value for each participant
    updatedBattle.participants = updatedBattle.participants.map(p => {
      const totalValue = p.items.reduce((sum, item) => sum + (item.item?.price || 0), 0);
      return { ...p, totalValue };
    });
    
    // Calculate the total battle value
    const totalBattleValue = updatedBattle.participants.reduce((sum, p) => sum + p.totalValue, 0);
    updatedBattle.totalValue = totalBattleValue;
    
    // Determine the winner based on the battle mode
    if (updatedBattle.mode === 'solo') {
      // In solo mode, the player always wins
      updatedBattle.winner = user?.id || '';
      
      // Award the player their total item value
      if (user) {
        const userParticipant = updatedBattle.participants.find(p => p.id === user.id);
        if (userParticipant) {
          updateBalance(userParticipant.totalValue);
        }
      }
      
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
      toast.success('You won all your items!');
    } else if (updatedBattle.mode === '2v2') {
      // In 2v2 mode, calculate team values
      const team1Value = updatedBattle.participants
        .filter(p => p.team === 1)
        .reduce((sum, p) => sum + p.totalValue, 0);
        
      const team2Value = updatedBattle.participants
        .filter(p => p.team === 2)
        .reduce((sum, p) => sum + p.totalValue, 0);
      
      // Determine winning team
      if (team1Value > team2Value) {
        updatedBattle.winningTeam = 1;
        updatedBattle.winner = user?.id || '';
        
        // Award player
        if (user) {
          updateBalance(totalBattleValue);
          playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
          toast.success(`Your team won ${totalBattleValue} gems!`);
        }
      } else {
        updatedBattle.winningTeam = 2;
        // Find the first opponent
        const opponent = updatedBattle.participants.find(p => p.team === 2);
        updatedBattle.winner = opponent?.id || '';
        
        playSound('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3');
        toast.error('Your team lost the battle. Better luck next time!');
      }
    } else {
      // For 1v1 and 4-player modes
      // Find participant with highest total value
      let highestValue = -1;
      let winnerId = '';
      
      updatedBattle.participants.forEach(p => {
        if (p.totalValue > highestValue) {
          highestValue = p.totalValue;
          winnerId = p.id;
        }
      });
      
      updatedBattle.winner = winnerId;
      
      // Award player if they won
      if (winnerId === user?.id) {
        playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
        toast.success(`You won ${totalBattleValue} gems!`);
        
        if (user) {
          updateBalance(totalBattleValue);
        }
      } else {
        playSound('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3');
        toast.error('You lost the battle. Better luck next time!');
      }
    }
    
    return updatedBattle;
  };
  
  // Handle case opening completion for a participant
  const handleComplete = (item: SliderItem, participantId: string, battleId: string) => {
    if (selectedBattle && battleId === selectedBattle.id) {
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3', 0.3);
      
      // Update the battle with the participant's item
      setBattles(prev => 
        prev.map(battle => {
          if (battle.id === battleId) {
            // Update the participant's current item
            const updatedParticipants = battle.participants.map(p => {
              if (p.id === participantId) {
                const updatedItems = [...p.items];
                updatedItems[battle.currentCaseIndex] = {
                  ...updatedItems[battle.currentCaseIndex],
                  item: item
                };
                
                return {
                  ...p,
                  items: updatedItems,
                  isSpinning: false
                };
              }
              return p;
            });
            
            // Check if all participants have completed the current case
            const allCompleted = updatedParticipants.every(p => !p.isSpinning);
            
            // If all completed, wait a moment and then move to the next case
            if (allCompleted) {
              setTimeout(() => {
                moveToNextCase(battleId);
              }, 1500); // Wait 1.5 seconds before moving to next case
            }
            
            return {
              ...battle,
              participants: updatedParticipants
            };
          }
          return battle;
        })
      );
      
      // Update selected battle if needed
      setSelectedBattle(prev => {
        if (!prev || prev.id !== battleId) return prev;
        
        // Update the participant's current item
        const updatedParticipants = prev.participants.map(p => {
          if (p.id === participantId) {
            const updatedItems = [...p.items];
            updatedItems[prev.currentCaseIndex] = {
              ...updatedItems[prev.currentCaseIndex],
              item: item
            };
            
            return {
              ...p,
              items: updatedItems,
              isSpinning: false
            };
          }
          return p;
        });
        
        return {
          ...prev,
          participants: updatedParticipants
        };
      });
      
      // Update lastWon if the participant is the user
      if (participantId === user?.id) {
        setLastWon(item);
      }
    }
  };
  
  // Simulate bot spins
  useEffect(() => {
    if (selectedBattle?.status === 'active') {
      // Find all bot participants that are spinning
      const spinningBots = selectedBattle.participants.filter(p => p.isBot && p.isSpinning);
      
      // For each bot, set a timeout to complete their spin
      spinningBots.forEach(bot => {
        const currentCaseId = selectedBattle.cases[selectedBattle.currentCaseIndex].caseId;
        const caseItems = availableCases.find(c => c.id === currentCaseId)?.items || [];
        
        const randomSpinTime = 5000 + Math.random() * 2000; // Between 5-7 seconds
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * caseItems.length);
          const botItem = caseItems[randomIndex];
          handleComplete(botItem, bot.id, selectedBattle.id);
        }, randomSpinTime);
      });
    }
  }, [selectedBattle?.status, selectedBattle?.currentCaseIndex]);
  
  // Helper functions for color classes
  const getRarityColorClass = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-400';
      case 'uncommon': return 'from-green-600 to-green-500';
      case 'rare': return 'from-blue-700 to-blue-600';
      case 'epic': return 'from-purple-700 to-purple-600';
      case 'legendary': return 'from-amber-600 to-amber-500';
      case 'mythical': return 'from-red-700 to-red-600';
      default: return 'from-gray-500 to-gray-400';
    }
  };
  
  const getRarityTextColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-200';
      case 'uncommon': return 'text-green-300';
      case 'rare': return 'text-blue-300';
      case 'epic': return 'text-purple-300';
      case 'legendary': return 'text-amber-300';
      case 'mythical': return 'text-red-300';
      default: return 'text-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-[#0e1521] to-[#1A1F2C]">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] bg-clip-text text-transparent">
            GemStorm Case Battles
          </h1>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleMute}
              className="bg-black/90 border-primary/30"
            >
              {isMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
            </Button>
            
            <div className="bg-black/90 px-4 py-2 rounded-lg flex items-center gap-2 border border-primary/30">
              <Gem className="h-5 w-5 text-cyan-400" />
              <span className="font-bold text-xl text-white">{user?.balance || 0}</span>
            </div>
          </div>
        </header>
        
        <Tabs defaultValue="battle" className="mb-8">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 bg-black/90 border border-primary/30">
            <TabsTrigger value="battle" className="text-lg py-3 data-[state=active]:bg-[#1EAEDB]/50 text-white">
              <Sword className="mr-2 h-5 w-5" /> Battle Arena
            </TabsTrigger>
            <TabsTrigger value="open" className="text-lg py-3 data-[state=active]:bg-[#1EAEDB]/50 text-white">
              <PlusCircle className="mr-2 h-5 w-5" /> Open Cases
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="battle" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Left sidebar - Case Selection and Battle Creation */}
              <div className="md:col-span-1 space-y-6">
                <Card className="bg-black/90 border-primary/30 backdrop-blur-sm overflow-hidden shadow-lg">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Create Battle</h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-300">Select Mode</label>
                        <div className="grid grid-cols-4 gap-2">
                          <Button 
                            variant={mode === 'solo' ? 'default' : 'outline'} 
                            onClick={() => setMode('solo')}
                            className={`flex flex-col h-auto py-2 border-primary/40 text-white
                              ${mode === 'solo' ? 'bg-[#1EAEDB] hover:bg-[#33C3F0]' : 'bg-black/80 hover:bg-black/90'}`}
                          >
                            <Trophy className="h-5 w-5 mb-1" />
                            <span className="text-xs">Solo</span>
                          </Button>
                          <Button 
                            variant={mode === '1v1' ? 'default' : 'outline'} 
                            onClick={() => setMode('1v1')}
                            className={`flex flex-col h-auto py-2 border-primary/40 text-white
                              ${mode === '1v1' ? 'bg-[#1EAEDB] hover:bg-[#33C3F0]' : 'bg-black/80 hover:bg-black/90'}`}
                          >
                            <Bot className="h-5 w-5 mb-1" />
                            <span className="text-xs">1v1</span>
                          </Button>
                          <Button 
                            variant={mode === '2v2' ? 'default' : 'outline'} 
                            onClick={() => setMode('2v2')}
                            className={`flex flex-col h-auto py-2 border-primary/40 text-white
                              ${mode === '2v2' ? 'bg-[#1EAEDB] hover:bg-[#33C3F0]' : 'bg-black/80 hover:bg-black/90'}`}
                          >
                            <Users className="h-5 w-5 mb-1" />
                            <span className="text-xs">2v2</span>
                          </Button>
                          <Button 
                            variant={mode === '4-player' ? 'default' : 'outline'} 
                            onClick={() => setMode('4-player')}
                            className={`flex flex-col h-auto py-2 border-primary/40 text-white
                              ${mode === '4-player' ? 'bg-[#1EAEDB] hover:bg-[#33C3F0]' : 'bg-black/80 hover:bg-black/90'}`}
                          >
                            <Shield className="h-5 w-5 mb-1" />
                            <span className="text-xs">4P</span>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Multiple Case Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-gray-300">Select Cases</label>
                          <Button
                            onClick={addCase}
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 py-1 text-xs bg-black/80 border-primary/40 text-white hover:bg-[#1EAEDB]/20"
                          >
                            <PlusCircle size={14} className="mr-1" /> Add Case
                          </Button>
                        </div>
                        
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                          {selectedCases.map((selection, index) => (
                            <div key={index} className="flex items-center gap-2 p-2
