
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { playButtonSound } from "@/utils/sounds";
import { Box, Plus, Minus, Skull, Users, Bot, Dice1, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Battle } from './CaseBattlesList';

// Case types
interface CaseType {
  id: string;
  name: string;
  price: number;
}

const CASE_TYPES: CaseType[] = [
  { id: 'standard', name: 'Standard Case', price: 100 },
  { id: 'premium', name: 'Premium Case', price: 500 },
  { id: 'battle', name: 'Battle Case', price: 250 },
];

// Battle configurations
type BattleConfig = {
  id: string;
  name: string;
  maxPlayers: number;
  rounds: number;
};

const BATTLE_CONFIGS: BattleConfig[] = [
  { id: '1v1', name: '1v1 Battle', maxPlayers: 2, rounds: 3 },
  { id: '2v2', name: '2v2 Battle', maxPlayers: 4, rounds: 3 },
  { id: '1v1v1', name: '1v1v1 Battle', maxPlayers: 3, rounds: 3 },
  { id: '1v1v1v1', name: '1v1v1v1 Battle', maxPlayers: 4, rounds: 3 },
];

interface CaseBattleCreatorProps {
  onBattleCreate: (battleData: Battle) => void;
}

const CaseBattleCreator: React.FC<CaseBattleCreatorProps> = ({ onBattleCreate }) => {
  const { user } = useUser();
  const [battleType, setBattleType] = useState<string>('1v1');
  const [caseType, setCaseType] = useState<string>('standard');
  const [rounds, setRounds] = useState<number>(3);
  const [enableBots, setEnableBots] = useState<boolean>(false);
  const [cursedMode, setCursedMode] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  
  // Get current battle configuration
  const currentBattleConfig = BATTLE_CONFIGS.find(config => config.id === battleType) || BATTLE_CONFIGS[0];
  
  // Get current case configuration
  const currentCase = CASE_TYPES.find(caseItem => caseItem.id === caseType) || CASE_TYPES[0];
  
  // Calculate total cost
  const calculateTotalCost = () => {
    const casePrice = currentCase.price;
    return casePrice * rounds;
  };
  
  // Handle battle creation
  const handleCreateBattle = () => {
    playButtonSound();
    
    if (!user) {
      toast.error('Please login to create a battle');
      return;
    }
    
    const totalCost = calculateTotalCost();
    if (user.balance < totalCost) {
      toast.error(`Insufficient balance. You need ${totalCost} gems.`);
      return;
    }
    
    setIsCreating(true);
    
    // Create battle data
    const battleData: Battle = {
      id: `battle-${Date.now()}`,
      type: battleType,
      caseType: caseType,
      rounds,
      cursedMode,
      creator: {
        id: user.id,
        name: user.username,
        avatar: user.avatar
      },
      players: [{
        id: user.id,
        name: user.username,
        avatar: user.avatar
      }],
      maxPlayers: currentBattleConfig.maxPlayers,
      cost: totalCost,
      status: 'waiting',
      createdAt: new Date()
    };
    
    // Fill with bots if enabled
    if (enableBots) {
      const botNames = ['Bot_Master', 'CryptoBot', 'LuckyBot', 'BotLegend'];
      
      for (let i = 1; i < currentBattleConfig.maxPlayers; i++) {
        battleData.players.push({
          id: `bot-${i}`,
          name: botNames[Math.floor(Math.random() * botNames.length)],
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=Bot${i}`,
          isBot: true
        });
      }
      
      // If all slots are filled with bots, start the battle immediately
      battleData.status = 'starting';
      
      setTimeout(() => {
        toast.success('Battle is starting!');
        onBattleCreate({...battleData, status: 'in-progress'});
        setIsCreating(false);
      }, 1500);
    } else {
      // No bots, just create the battle and wait for players
      setTimeout(() => {
        toast.success('Battle created! Waiting for players to join...');
        onBattleCreate(battleData);
        setIsCreating(false);
      }, 1000);
    }
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Box className="h-5 w-5 text-primary" />
        Create a Case Battle
      </h2>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm">Battle Type</Label>
          <TabsList className="w-full grid grid-cols-4 h-auto">
            {BATTLE_CONFIGS.map(config => (
              <TabsTrigger 
                key={config.id} 
                value={config.id}
                onClick={() => setBattleType(config.id)}
                className={battleType === config.id ? "bg-primary" : ""}
              >
                {config.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="text-xs text-muted-foreground">
            {currentBattleConfig.maxPlayers} players, {currentBattleConfig.rounds} rounds default
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="text-sm">Case Type</Label>
          <Select 
            value={caseType} 
            onValueChange={setCaseType}
          >
            <SelectTrigger className="bg-black/60 border-white/10">
              <SelectValue placeholder="Select Case Type" />
            </SelectTrigger>
            <SelectContent>
              {CASE_TYPES.map(caseItem => (
                <SelectItem key={caseItem.id} value={caseItem.id}>
                  {caseItem.name} ({caseItem.price} gems)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label className="text-sm">Number of Rounds</Label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setRounds(prev => Math.max(1, prev - 1))}
              className="bg-black/60 border-white/10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input 
              type="number" 
              value={rounds} 
              onChange={e => setRounds(parseInt(e.target.value) || 1)}
              min={1}
              max={10}
              className="text-center bg-black/60 border-white/10"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setRounds(prev => Math.min(10, prev + 1))}
              className="bg-black/60 border-white/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Fill empty slots with bots</Label>
            </div>
            <Switch 
              checked={enableBots}
              onCheckedChange={setEnableBots}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skull className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Cursed Mode (worst items win)</Label>
            </div>
            <Switch 
              checked={cursedMode}
              onCheckedChange={setCursedMode}
            />
          </div>
        </div>
        
        <div className="rounded-lg bg-black/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Battle Cost:</span>
            <span className="font-bold">{calculateTotalCost()} gems</span>
          </div>
          
          <Button 
            className="w-full btn-primary"
            onClick={handleCreateBattle}
            disabled={isCreating || !user || (user && user.balance < calculateTotalCost())}
          >
            {isCreating ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Dice1 className="mr-2 h-4 w-4" />
                Create Battle
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseBattleCreator;
