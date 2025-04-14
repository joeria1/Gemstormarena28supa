
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { Gift, Lock, Check } from 'lucide-react';
import LightningEffect from '../GameEffects/LightningEffect';
import PulseAnimation from '../GameEffects/PulseAnimation';

interface Reward {
  id: number;
  level: number;
  title: string;
  description: string;
  amount: number;
  claimed: boolean;
  type: 'coins' | 'case' | 'bonus';
}

interface LevelRewardsProps {
  currentLevel: number;
}

const LevelRewards: React.FC<LevelRewardsProps> = ({ currentLevel }) => {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([
    { 
      id: 1, 
      level: 1, 
      title: 'Welcome Bonus', 
      description: 'Thanks for joining DUMP.FUN!',
      amount: 100, 
      claimed: true, 
      type: 'coins' 
    },
    { 
      id: 2, 
      level: 2, 
      title: 'Daily Case Upgrade', 
      description: 'Your daily case has been upgraded',
      amount: 1, 
      claimed: currentLevel >= 2, 
      type: 'case' 
    },
    { 
      id: 3, 
      level: 5, 
      title: 'Level 5 Reward', 
      description: 'You reached level 5!',
      amount: 500, 
      claimed: false, 
      type: 'coins' 
    },
    { 
      id: 4, 
      level: 10, 
      title: 'VIP Bonus', 
      description: 'Welcome to VIP status',
      amount: 1000, 
      claimed: false, 
      type: 'coins' 
    },
    { 
      id: 5, 
      level: 15, 
      title: 'Premium Case', 
      description: 'Exclusive premium case',
      amount: 1, 
      claimed: false, 
      type: 'case' 
    },
    { 
      id: 6, 
      level: 20, 
      title: 'Deposit Bonus', 
      description: '50% bonus on your next deposit',
      amount: 50, 
      claimed: false, 
      type: 'bonus' 
    },
  ]);
  const [claimingRewardId, setClaimingRewardId] = useState<number | null>(null);
  const [showLightning, setShowLightning] = useState(false);
  
  const handleClaimReward = (reward: Reward) => {
    if (reward.claimed || currentLevel < reward.level) return;
    
    setClaimingRewardId(reward.id);
    setShowLightning(true);
    
    // Simulate claiming process
    setTimeout(() => {
      setRewards(rewards.map(r => r.id === reward.id ? { ...r, claimed: true } : r));
      setClaimingRewardId(null);
      setShowLightning(false);
      
      toast({
        title: "Reward Claimed!",
        description: `You claimed: ${reward.title}`,
      });
    }, 1000);
  };
  
  // Group rewards by availability (available, claimed, locked)
  const availableRewards = rewards.filter(r => currentLevel >= r.level && !r.claimed);
  const claimedRewards = rewards.filter(r => r.claimed);
  const lockedRewards = rewards.filter(r => currentLevel < r.level);
  
  const getRewardColor = (type: string) => {
    switch (type) {
      case 'coins':
        return 'bg-yellow-500';
      case 'case':
        return 'bg-purple-500';
      case 'bonus':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Level Rewards</h2>
      
      {availableRewards.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">Available Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRewards.map((reward) => (
              <motion.div
                key={reward.id}
                whileHover={{ scale: 1.03 }}
                className="h-full"
              >
                <PulseAnimation 
                  isActive={true}
                  color="147, 51, 234"
                  className="h-full"
                >
                  <Card className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500 h-full flex flex-col">
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-full ${getRewardColor(reward.type)} flex items-center justify-center mr-3`}>
                        <Gift size={20} className="text-white" />
                      </div>
                      <div>
                        <Badge className="bg-purple-600 mb-1">{`Level ${reward.level}`}</Badge>
                        <h4 className="text-lg font-bold text-white">{reward.title}</h4>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{reward.description}</p>
                    <div className="mt-auto">
                      <Button
                        onClick={() => handleClaimReward(reward)}
                        disabled={claimingRewardId !== null}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {claimingRewardId === reward.id ? "Claiming..." : "Claim Reward"}
                      </Button>
                    </div>
                  </Card>
                </PulseAnimation>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {lockedRewards.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Locked Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedRewards.map((reward) => (
              <Card key={reward.id} className="p-4 bg-gray-800 border-gray-700 opacity-70">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    <Lock size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <Badge className="bg-gray-600 mb-1">{`Level ${reward.level}`}</Badge>
                    <h4 className="text-lg font-bold text-gray-300">{reward.title}</h4>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-3">{reward.description}</p>
                <Button disabled className="w-full bg-gray-700 text-gray-400">
                  Reach Level {reward.level} to Unlock
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {claimedRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">Claimed Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claimedRewards.map((reward) => (
              <Card key={reward.id} className="p-4 bg-gray-800 border-green-700/30">
                <div className="flex items-center mb-2">
                  <div className={`w-10 h-10 rounded-full ${getRewardColor(reward.type)}/50 flex items-center justify-center mr-3`}>
                    <Check size={20} className="text-white" />
                  </div>
                  <div>
                    <Badge className="bg-green-700/50 mb-1">{`Level ${reward.level}`}</Badge>
                    <h4 className="text-lg font-bold text-gray-300">{reward.title}</h4>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-3">{reward.description}</p>
                <Button disabled className="w-full bg-green-900/30 text-green-400">
                  Claimed
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Lightning effect when claiming rewards */}
      <LightningEffect isVisible={showLightning} onComplete={() => setShowLightning(false)} />
    </div>
  );
};

export default LevelRewards;
