
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
                            <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-black/70 border border-primary/20">
                              <div className="flex-grow">
                                <Select 
                                  value={selection.caseId}
                                  onValueChange={(value) => updateCaseSelection(index, value)}
                                >
                                  <SelectTrigger className="bg-black/90 border-primary/30 text-white">
                                    <SelectValue placeholder="Select a case" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#1A1F2C] border-primary/40">
                                    {availableCases.map(caseItem => (
                                      <SelectItem key={caseItem.id} value={caseItem.id}>
                                        {caseItem.name} - {caseItem.price} gems
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center h-10 rounded-md overflow-hidden border border-primary/30">
                                <Button 
                                  variant="ghost"
                                  size="icon"
                                  className="h-full rounded-none bg-black/90 text-white hover:bg-[#1EAEDB]/20"
                                  onClick={() => updateCaseQuantity(index, selection.quantity - 1)}
                                  disabled={selection.quantity <= 1}
                                >
                                  <Minus size={14} />
                                </Button>
                                <div className="h-full w-8 flex items-center justify-center bg-black/90 text-white">
                                  {selection.quantity}
                                </div>
                                <Button 
                                  variant="ghost"
                                  size="icon"
                                  className="h-full rounded-none bg-black/90 text-white hover:bg-[#1EAEDB]/20"
                                  onClick={() => updateCaseQuantity(index, selection.quantity + 1)}
                                  disabled={selection.quantity >= 5}
                                >
                                  <PlusCircle size={14} />
                                </Button>
                              </div>
                              
                              {selectedCases.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCase(index)}
                                  className="h-8 w-8 bg-black/90 hover:bg-red-500/20 hover:text-red-400 border border-primary/30 text-gray-400"
                                >
                                  <X size={14} />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Total Cost:</span>
                        <span className="flex items-center text-white">
                          <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                          <span className="font-semibold">{calculateTotalCost()}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Your Balance:</span>
                        <span className="flex items-center text-white">
                          <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                          <span className="font-semibold">{user?.balance || 0}</span>
                        </span>
                      </div>
                      
                      <Button 
                        onClick={createBattle}
                        disabled={!user || (user.balance < calculateTotalCost())}
                        className="w-full bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] hover:from-[#33C3F0] hover:to-[#1EAEDB]"
                      >
                        Create Battle
                      </Button>
                    </div>
                    
                    <div className="border-t border-primary/20 pt-4">
                      <h3 className="text-sm text-gray-300 mb-2">Active Battles</h3>
                      <div className="space-y-2">
                        {battles.length === 0 ? (
                          <div className="text-sm text-center text-gray-400 py-2">
                            No active battles
                          </div>
                        ) : (
                          battles.map(battle => (
                            <Button 
                              key={battle.id} 
                              variant="outline" 
                              className={`w-full justify-between ${selectedBattle?.id === battle.id ? 'border-cyan-500' : 'border-primary/40'} bg-black/90 text-white`}
                              onClick={() => setSelectedBattle(battle)}
                            >
                              <span>Battle {battle.id.slice(-4)}</span>
                              <div className="flex items-center text-xs">
                                {battle.mode === 'solo' && <Trophy className="h-3 w-3 mr-1" />}
                                {battle.mode === '1v1' && <Bot className="h-3 w-3 mr-1" />}
                                {battle.mode === '2v2' && <Users className="h-3 w-3 mr-1" />}
                                {battle.mode === '4-player' && <Shield className="h-3 w-3 mr-1" />}
                                <span>{battle.mode}</span>
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Last won item */}
                {lastWon && (
                  <Card className="bg-black/90 border-primary/30 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-4">
                      <h2 className="text-lg font-semibold mb-2 text-white">Last Item Won:</h2>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded bg-gradient-to-b p-2 ${getRarityColorClass(lastWon.rarity)}`}>
                          <img 
                            src={lastWon.image || '/placeholder.svg'} 
                            alt={lastWon.name} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/placeholder.svg';
                            }} 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{lastWon.name}</h3>
                          <p className={`text-sm font-bold capitalize ${getRarityTextColor(lastWon.rarity)}`}>
                            {lastWon.rarity}
                          </p>
                          <div className="flex items-center mt-1">
                            <Gem className="h-3.5 w-3.5 text-cyan-400 mr-1" />
                            <span className="text-sm text-white">{lastWon.price}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Battle area - 3 columns */}
              <div className="md:col-span-3">
                {selectedBattle ? (
                  <div>
                    <Card className="mb-6 bg-black/90 border border-primary/30 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-2xl font-semibold text-white">
                              Case Battle
                              <span className="ml-2 text-sm bg-primary/20 px-2 py-1 rounded-full text-primary">
                                {selectedBattle.mode.toUpperCase()}
                              </span>
                            </h2>
                            <p className="text-gray-300 flex items-center">
                              <span className="mr-2">Total cases: {selectedBattle.cases.length}</span>
                              <span className="mr-2">|</span>
                              <span>
                                Current case: {selectedBattle.currentCaseIndex + 1} / {selectedBattle.cases.length}
                              </span>
                            </p>
                          </div>
                          
                          <div className="px-4 py-2 rounded-full bg-primary/20 border border-primary/30 flex items-center text-white">
                            {selectedBattle.status === 'waiting' && 'Waiting'}
                            {selectedBattle.status === 'active' && (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin text-cyan-400" />
                                <span>Active</span>
                              </div>
                            )}
                            {selectedBattle.status === 'completed' && (
                              <div className="flex items-center">
                                <Trophy className="h-4 w-4 mr-2 text-cyan-400" />
                                <span>Completed</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Battle area layout based on mode */}
                        {(selectedBattle.mode === 'solo') ? (
                          // SOLO MODE - Full screen spinner
                          <div className="mb-6">
                            <div className="flex flex-col items-center justify-center mb-4">
                              <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-2
                                ${selectedBattle.participants[0].id === user?.id ? 'bg-[#1EAEDB]/40 border-2 border-[#1EAEDB]' : 'bg-black/90 border border-primary/40'}`}
                              >
                                {selectedBattle.participants[0].avatar ? (
                                  <img 
                                    src={selectedBattle.participants[0].avatar} 
                                    alt={selectedBattle.participants[0].name} 
                                    className="h-12 w-12 rounded-full"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = '/placeholder.svg';
                                    }}
                                  />
                                ) : (
                                  selectedBattle.participants[0].name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="text-lg font-medium text-white">
                                {selectedBattle.participants[0].name}
                                {selectedBattle.participants[0].id === user?.id && " (You)"}
                              </div>
                            </div>
                            
                            <div className="py-4">
                              {selectedBattle.participants[0].displaySlider && selectedBattle.participants[0].isSpinning ? (
                                <CaseSlider
                                  items={availableCases.find(c => c.id === selectedBattle.cases[selectedBattle.currentCaseIndex].caseId)?.items || []}
                                  onComplete={(item) => handleComplete(item, selectedBattle.participants[0].id, selectedBattle.id)}
                                  autoSpin={true}
                                  isCompact={false}
                                  highlightPlayer={true}
                                  options={{ 
                                    duration: 7000,
                                    itemSize: 'large' 
                                  }}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  {selectedBattle.participants[0].items[selectedBattle.currentCaseIndex]?.item ? (
                                    <div className="p-6 rounded-lg bg-black/70 border border-primary/20 max-w-sm mx-auto text-center">
                                      <div className={`w-32 h-32 rounded bg-gradient-to-b p-3 mx-auto mb-4
                                        ${getRarityColorClass(selectedBattle.participants[0].items[selectedBattle.currentCaseIndex].item!.rarity)}`}
                                      >
                                        <img 
                                          src={selectedBattle.participants[0].items[selectedBattle.currentCaseIndex].item!.image || '/placeholder.svg'} 
                                          alt={selectedBattle.participants[0].items[selectedBattle.currentCaseIndex].item!.name} 
                                          className="w-full h-full object-contain"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = '/placeholder.svg';
                                          }}
                                        />
                                      </div>
                                      <div className="text-xl font-medium text-white mb-1">
                                        {selectedBattle.participants[0].items[selectedBattle.currentCaseIndex].item!.name}
                                      </div>
                                      <p className={`text-sm font-bold capitalize mb-2 ${getRarityTextColor(selectedBattle.participants[0].items[selectedBattle.currentCaseIndex].item!.rarity)}`}>
                                        {selectedBattle.participants[0].items[selectedBattle.currentCaseIndex].item!.rarity}
                                      </p>
                                      <div className="flex items-center justify-center">
                                        <Gem className="h-5 w-5 text-cyan-400 mr-1" />
                                        <span className="text-lg text-white">{selectedBattle.participants[0].items[selectedBattle.currentCaseIndex].item!.price}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-[240px] border-2 border-dashed border-primary/40 rounded-lg flex flex-col items-center justify-center bg-black/70 w-full">
                                      <ShieldAlert className="text-primary/40 h-16 w-16 mb-2" />
                                      <div className="text-primary/40">Waiting for spin...</div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : selectedBattle.mode === '1v1' ? (
                          // 1V1 MODE - Two players side by side
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {selectedBattle.participants.map((participant, index) => (
                              <div key={participant.id} className="flex flex-col">
                                {/* Player header with name and avatar */}
                                <div className="flex items-center mb-3">
                                  <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-2
                                    ${participant.id === user?.id ? 'bg-[#1EAEDB]/40 border-2 border-[#1EAEDB]' : 'bg-black/80 border border-primary/40'} 
                                    ${participant.isSpinning ? 'animate-pulse' : ''}`}
                                  >
                                    {participant.avatar ? (
                                      <img 
                                        src={participant.avatar} 
                                        alt={participant.name} 
                                        className="h-10 w-10 rounded-full"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.onerror = null;
                                          target.src = '/placeholder.svg';
                                        }}
                                      />
                                    ) : (
                                      participant.isBot ? <Bot className="h-6 w-6 text-white" /> : participant.name.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="text-lg font-medium text-white flex items-center">
                                      {participant.name}
                                      {participant.id === user?.id && " (You)"}
                                      
                                      {/* Winner/Loser indicator */}
                                      {selectedBattle.status === 'completed' && (
                                        selectedBattle.winner === participant.id ? (
                                          <span className="ml-2 px-2 py-0.5 bg-green-700/50 border border-green-600 rounded-full text-xs font-medium text-green-400 flex items-center">
                                            <Check size={12} className="mr-1" /> Winner
                                          </span>
                                        ) : (
                                          <span className="ml-2 px-2 py-0.5 bg-red-900/50 border border-red-800 rounded-full text-xs font-medium text-red-400 flex items-center">
                                            <CircleX size={12} className="mr-1" /> Loser
                                          </span>
                                        )
                                      )}
                                    </div>
                                    
                                    {/* Total value for completed battles */}
                                    {selectedBattle.status === 'completed' && (
                                      <div className="flex items-center text-sm">
                                        <Gem className="h-3.5 w-3.5 text-cyan-400 mr-1" />
                                        <span className={selectedBattle.winner === participant.id ? "text-green-400" : "text-white"}>
                                          {participant.totalValue}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Case slider */}
                                {participant.displaySlider && participant.isSpinning ? (
                                  <CaseSlider
                                    items={availableCases.find(c => c.id === selectedBattle.cases[selectedBattle.currentCaseIndex].caseId)?.items || []}
                                    onComplete={(item) => handleComplete(item, participant.id, selectedBattle.id)}
                                    autoSpin={true}
                                    isCompact={false}
                                    playerName={participant.name}
                                    highlightPlayer={participant.id === user?.id}
                                    options={{ 
                                      duration: 6000 + (index * 1000) // Stagger animation times
                                    }}
                                  />
                                ) : (
                                  <div className="bg-black/70 rounded-lg border border-primary/20 p-4">
                                    {participant.items[selectedBattle.currentCaseIndex]?.item ? (
                                      <div className="flex flex-col items-center">
                                        <div className={`w-24 h-24 rounded bg-gradient-to-b p-2 mb-3 ${getRarityColorClass(participant.items[selectedBattle.currentCaseIndex].item!.rarity)}`}>
                                          <img 
                                            src={participant.items[selectedBattle.currentCaseIndex].item!.image || '/placeholder.svg'} 
                                            alt={participant.items[selectedBattle.currentCaseIndex].item!.name} 
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.onerror = null;
                                              target.src = '/placeholder.svg';
                                            }}
                                          />
                                        </div>
                                        <div className="text-lg font-medium text-white">
                                          {participant.items[selectedBattle.currentCaseIndex].item!.name}
                                        </div>
                                        <p className={`text-sm font-bold capitalize ${getRarityTextColor(participant.items[selectedBattle.currentCaseIndex].item!.rarity)}`}>
                                          {participant.items[selectedBattle.currentCaseIndex].item!.rarity}
                                        </p>
                                        <div className="flex items-center mt-2">
                                          <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                                          <span className="text-white">{participant.items[selectedBattle.currentCaseIndex].item!.price}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-[200px] border-2 border-dashed border-primary/40 rounded-lg flex flex-col items-center justify-center">
                                        <ShieldAlert className="text-primary/40 h-12 w-12 mb-2" />
                                        <div className="text-primary/40">Waiting for spin...</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Show all previously won items */}
                                {selectedBattle.currentCaseIndex > 0 || selectedBattle.status === 'completed' ? (
                                  <div className="mt-4">
                                    <div className="text-sm text-gray-400 mb-2">Previous items:</div>
                                    <div className="grid grid-cols-3 gap-2">
                                      {participant.items.map((itemSlot, caseIndex) => (
                                        // Only show previous items
                                        (caseIndex !== selectedBattle.currentCaseIndex || selectedBattle.status === 'completed') && 
                                        itemSlot.item && (
                                          <div 
                                            key={`${participant.id}-case-${caseIndex}`}
                                            className={`p-2 rounded bg-black/80 border ${caseIndex === selectedBattle.currentCaseIndex ? 'border-cyan-500' : 'border-primary/20'}`}
                                          >
                                            <div className={`w-full aspect-square rounded bg-gradient-to-b p-1 ${getRarityColorClass(itemSlot.item.rarity)}`}>
                                              <img 
                                                src={itemSlot.item.image || '/placeholder.svg'} 
                                                alt={itemSlot.item.name} 
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.onerror = null;
                                                  target.src = '/placeholder.svg';
                                                }}
                                              />
                                            </div>
                                            <div className="mt-1 flex items-center justify-between">
                                              <span className={`text-xs ${getRarityTextColor(itemSlot.item.rarity)}`}>
                                                {itemSlot.item.rarity.slice(0, 3)}
                                              </span>
                                              <span className="text-xs text-white flex items-center">
                                                <Gem className="h-3 w-3 text-cyan-400 mr-0.5" />
                                                {itemSlot.item.price}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // 2V2 and 4-PLAYER MODES - Grid layout
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            {selectedBattle.participants.map((participant, index) => (
                              <div key={participant.id} className="flex flex-col">
                                {/* Player header with name and avatar */}
                                <div className="flex items-center mb-3">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-2
                                    ${participant.id === user?.id ? 'bg-[#1EAEDB]/40 border-2 border-[#1EAEDB]' : 
                                      participant.team === 1 ? 'bg-blue-900/60 border border-blue-700' :
                                      participant.team === 2 ? 'bg-red-900/60 border border-red-700' : 
                                      'bg-black/80 border border-primary/40'} 
                                    ${participant.isSpinning ? 'animate-pulse' : ''}`}
                                  >
                                    {participant.avatar ? (
                                      <img 
                                        src={participant.avatar} 
                                        alt={participant.name} 
                                        className="h-8 w-8 rounded-full"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.onerror = null;
                                          target.src = '/placeholder.svg';
                                        }}
                                      />
                                    ) : (
                                      participant.isBot ? <Bot className="h-5 w-5 text-white" /> : participant.name.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="text-sm font-medium text-white flex items-center">
                                      {participant.name}
                                      {participant.id === user?.id && " (You)"}
                                      
                                      {/* Team indicator for 2v2 */}
                                      {selectedBattle.mode === '2v2' && (
                                        <span className={`ml-1 px-2 py-0.5 text-xs rounded-full
                                          ${participant.team === 1 ? 'bg-blue-900/50 border border-blue-800 text-blue-400' : 
                                          'bg-red-900/50 border border-red-800 text-red-400'}`}>
                                          Team {participant.team}
                                        </span>
                                      )}
                                      
                                      {/* Winner/Loser indicator */}
                                      {selectedBattle.status === 'completed' && (
                                        selectedBattle.mode === '2v2' ? (
                                          selectedBattle.winningTeam === participant.team ? (
                                            <span className="ml-1 px-1.5 py-0.5 bg-green-700/50 border border-green-600 rounded-full text-xs font-medium text-green-400 flex items-center">
                                              <Check size={10} className="mr-0.5" /> Win
                                            </span>
                                          ) : (
                                            <span className="ml-1 px-1.5 py-0.5 bg-red-900/50 border border-red-800 rounded-full text-xs font-medium text-red-400 flex items-center">
                                              <CircleX size={10} className="mr-0.5" /> Loss
                                            </span>
                                          )
                                        ) : (
                                          selectedBattle.winner === participant.id ? (
                                            <span className="ml-1 px-1.5 py-0.5 bg-green-700/50 border border-green-600 rounded-full text-xs font-medium text-green-400 flex items-center">
                                              <Check size={10} className="mr-0.5" /> Win
                                            </span>
                                          ) : (
                                            <span className="ml-1 px-1.5 py-0.5 bg-red-900/50 border border-red-800 rounded-full text-xs font-medium text-red-400 flex items-center">
                                              <CircleX size={10} className="mr-0.5" /> Loss
                                            </span>
                                          )
                                        )
                                      )}
                                    </div>
                                    
                                    {/* Total value for completed battles */}
                                    {selectedBattle.status === 'completed' && (
                                      <div className="flex items-center text-xs">
                                        <Gem className="h-3 w-3 text-cyan-400 mr-0.5" />
                                        <span className={(selectedBattle.mode === '2v2' && selectedBattle.winningTeam === participant.team) || 
                                                       (selectedBattle.mode !== '2v2' && selectedBattle.winner === participant.id) ? 
                                                       "text-green-400" : "text-white"}>
                                          {participant.totalValue}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Case slider */}
                                {participant.displaySlider && participant.isSpinning ? (
                                  <CaseSlider
                                    items={availableCases.find(c => c.id === selectedBattle.cases[selectedBattle.currentCaseIndex].caseId)?.items || []}
                                    onComplete={(item) => handleComplete(item, participant.id, selectedBattle.id)}
                                    autoSpin={true}
                                    isCompact={true}
                                    playerName={participant.name}
                                    highlightPlayer={participant.id === user?.id}
                                    options={{ 
                                      duration: 6000 + (index * 800) // Stagger animation times
                                    }}
                                  />
                                ) : (
                                  <div className="bg-black/70 rounded-lg border border-primary/20 p-3">
                                    {participant.items[selectedBattle.currentCaseIndex]?.item ? (
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-16 h-16 rounded bg-gradient-to-b p-1.5 ${getRarityColorClass(participant.items[selectedBattle.currentCaseIndex].item!.rarity)}`}>
                                          <img 
                                            src={participant.items[selectedBattle.currentCaseIndex].item!.image || '/placeholder.svg'} 
                                            alt={participant.items[selectedBattle.currentCaseIndex].item!.name} 
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.onerror = null;
                                              target.src = '/placeholder.svg';
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-white">
                                            {participant.items[selectedBattle.currentCaseIndex].item!.name}
                                          </div>
                                          <p className={`text-xs font-bold capitalize ${getRarityTextColor(participant.items[selectedBattle.currentCaseIndex].item!.rarity)}`}>
                                            {participant.items[selectedBattle.currentCaseIndex].item!.rarity}
                                          </p>
                                          <div className="flex items-center mt-1">
                                            <Gem className="h-3 w-3 text-cyan-400 mr-0.5" />
                                            <span className="text-xs text-white">{participant.items[selectedBattle.currentCaseIndex].item!.price}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-[120px] border-2 border-dashed border-primary/40 rounded-lg flex flex-col items-center justify-center">
                                        <ShieldAlert className="text-primary/40 h-10 w-10 mb-1" />
                                        <div className="text-primary/40 text-sm">Waiting for spin...</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Show all previously won items */}
                                {selectedBattle.currentCaseIndex > 0 || selectedBattle.status === 'completed' ? (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-400 mb-1">Previous items:</div>
                                    <div className="grid grid-cols-3 gap-1">
                                      {participant.items.map((itemSlot, caseIndex) => (
                                        // Only show previous items
                                        (caseIndex !== selectedBattle.currentCaseIndex || selectedBattle.status === 'completed') && 
                                        itemSlot.item && (
                                          <div 
                                            key={`${participant.id}-case-${caseIndex}`}
                                            className={`p-1 rounded bg-black/80 border ${caseIndex === selectedBattle.currentCaseIndex ? 'border-cyan-500' : 'border-primary/20'}`}
                                          >
                                            <div className={`w-full aspect-square rounded bg-gradient-to-b p-1 ${getRarityColorClass(itemSlot.item.rarity)}`}>
                                              <img 
                                                src={itemSlot.item.image || '/placeholder.svg'} 
                                                alt={itemSlot.item.name} 
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.onerror = null;
                                                  target.src = '/placeholder.svg';
                                                }}
                                              />
                                            </div>
                                            <div className="mt-1 flex items-center justify-between">
                                              <span className="text-xs flex items-center">
                                                <Gem className="h-2.5 w-2.5 text-cyan-400 mr-0.5" />
                                                {itemSlot.item.price}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Case indicator (which case is spinning) */}
                        {selectedBattle.cases.length > 1 && (
                          <div className="flex justify-center mb-4">
                            <div className="flex items-center space-x-2">
                              {selectedBattle.cases.map((caseSelection, index) => {
                                const caseDetails = availableCases.find(c => c.id === caseSelection.caseId);
                                return (
                                  <div 
                                    key={`case-${index}`} 
                                    className={`flex flex-col items-center ${index === selectedBattle.currentCaseIndex ? 'opacity-100' : 'opacity-50'}`}
                                  >
                                    <div 
                                      className={`p-1 rounded-full ${index === selectedBattle.currentCaseIndex 
                                        ? 'bg-[#1EAEDB]/50 border-2 border-[#1EAEDB]' 
                                        : index < selectedBattle.currentCaseIndex 
                                          ? 'bg-green-900/50 border border-green-700'
                                          : 'bg-black/70 border border-primary/30'}`}
                                    >
                                      <img 
                                        src={caseDetails?.image || '/placeholder.svg'} 
                                        alt={caseDetails?.name || 'Case'} 
                                        className="w-8 h-8 rounded-full object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.onerror = null;
                                          target.src = '/placeholder.svg';
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-white mt-1">{caseDetails?.name || `Case ${index + 1}`}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Battle result */}
                        {selectedBattle.status === 'completed' && (
                          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-black/90 to-primary/10 border border-primary/30">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm text-gray-300">Total Battle Value</div>
                                <div className="flex items-center gap-1.5">
                                  <Gem className="h-4 w-4 text-cyan-400" />
                                  <span className="text-xl font-bold text-white">{selectedBattle.totalValue}</span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm text-gray-300">Winner</div>
                                {selectedBattle.mode === '2v2' ? (
                                  <div className="font-semibold text-white">
                                    {selectedBattle.winningTeam === 1 && user?.id === selectedBattle.participants.find(p => p.team === 1)?.id
                                      ? 'Your team won!' 
                                      : selectedBattle.winningTeam === 1 
                                        ? 'Team 1 won'
                                        : 'Team 2 won'
                                    }
                                  </div>
                                ) : (
                                  <div className="font-semibold text-white">
                                    {selectedBattle.winner === user?.id 
                                      ? 'You won the battle!' 
                                      : `${selectedBattle.participants.find(p => p.id === selectedBattle.winner)?.name || 'Unknown'} won`
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <Button 
                                variant="outline"
                                className="border-primary/40 bg-black/70 text-white"
                                onClick={() => setSelectedBattle(null)}
                              >
                                Close Battle
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] bg-black/90 border border-primary/30 rounded-xl">
                    <div className="text-center p-8">
                      <Trophy className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold mb-4 text-white">No Battle Selected</h3>
                      <p className="text-gray-300 max-w-md mx-auto mb-6">
                        Create a new battle or select an existing one to start competing!
                      </p>
                      <Button 
                        onClick={createBattle} 
                        disabled={!user}
                        className="bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] hover:from-[#33C3F0] hover:to-[#1EAEDB]"
                      >
                        Create New Battle
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="open" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableCases.map(caseItem => (
                <Card key={caseItem.id} className="bg-black/80 border border-primary/30 overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
                  <div className="aspect-square flex items-center justify-center p-4 border-b border-primary/20">
                    <div className="w-40 h-40 bg-gradient-to-b from-primary/30 to-primary/10 rounded-lg border border-primary/30 flex items-center justify-center">
                      <img 
                        src={caseItem.image || '/placeholder.svg'} 
                        alt={caseItem.name} 
                        className="w-3/4 h-3/4 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-center font-semibold text-lg mb-1 text-white">{caseItem.name}</h3>
                    <div className="flex items-center justify-center mb-4 text-white">
                      <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                      <span>{caseItem.price}</span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] hover:from-[#33C3F0] hover:to-[#1EAEDB]"
                      onClick={() => {
                        setActiveCase(caseItem.id);
                        openCase();
                      }}
                    >
                      Open Case
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
