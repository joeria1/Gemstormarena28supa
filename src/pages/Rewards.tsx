
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../hooks/use-toast';
import { playSound } from '../utils/soundEffects';
import { SOUNDS } from '../utils/soundEffects';
import { Award, Gift, Star, CircleDollarSign, Copy } from 'lucide-react';

interface UserLevel {
  level: number;
  xp: number;
  nextLevelXp: number;
  rakeback: number;
  rewards: {
    gems: number;
    freeSpins: number;
  };
}

const generateAffiliateCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const Rewards: React.FC = () => {
  const [affiliateCode, setAffiliateCode] = useState<string>('');
  const [userAffiliateCode, setUserAffiliateCode] = useState<string>('');
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    rakeback: 0.05,
    rewards: {
      gems: 0,
      freeSpins: 0,
    }
  });
  const [wager, setWager] = useState<number>(0);
  const [tab, setTab] = useState<string>('affiliate');

  useEffect(() => {
    // Load saved data from localStorage
    const savedCode = localStorage.getItem('userAffiliateCode');
    if (savedCode) {
      setUserAffiliateCode(savedCode);
    } else {
      // Generate a new code if the user doesn't have one
      const newCode = generateAffiliateCode();
      setUserAffiliateCode(newCode);
      localStorage.setItem('userAffiliateCode', newCode);
    }

    // Load user level data
    const savedLevel = localStorage.getItem('userLevel');
    if (savedLevel) {
      setUserLevel(JSON.parse(savedLevel));
    }

    // Load wager data
    const savedWager = localStorage.getItem('userWager');
    if (savedWager) {
      setWager(parseFloat(savedWager));
    }
  }, []);

  const handleEnterAffiliateCode = () => {
    if (!affiliateCode) {
      toast({
        title: 'Error',
        description: 'Please enter an affiliate code',
        variant: 'destructive',
      });
      return;
    }

    const usedCodes = JSON.parse(localStorage.getItem('usedAffiliateCodes') || '[]');
    
    if (usedCodes.includes(affiliateCode)) {
      toast({
        title: 'Error',
        description: 'You have already used this affiliate code',
        variant: 'destructive',
      });
      return;
    }

    if (affiliateCode === userAffiliateCode) {
      toast({
        title: 'Error',
        description: 'You cannot use your own affiliate code',
        variant: 'destructive',
      });
      return;
    }

    // Save the used code
    localStorage.setItem('usedAffiliateCodes', JSON.stringify([...usedCodes, affiliateCode]));
    
    // Add gems to the user
    const currentGems = parseInt(localStorage.getItem('userGems') || '0');
    localStorage.setItem('userGems', (currentGems + 100).toString());
    
    playSound(SOUNDS.REWARD);
    
    toast({
      title: 'Success',
      description: 'You have earned 100 gems!',
      variant: 'default',
    });
    
    setAffiliateCode('');
  };

  const copyAffiliateCode = () => {
    navigator.clipboard.writeText(userAffiliateCode);
    toast({
      title: 'Copied!',
      description: 'Affiliate code copied to clipboard',
      variant: 'default',
    });
  };

  const simulateLevelUp = () => {
    // This is for testing the level up system
    const newWager = wager + 500;
    const xpGained = Math.floor(newWager * 0.02);
    const newXp = userLevel.xp + xpGained;
    
    let newLevel = userLevel.level;
    let nextLevelXp = userLevel.nextLevelXp;
    
    if (newXp >= nextLevelXp) {
      newLevel++;
      nextLevelXp = Math.floor(nextLevelXp * 1.5);
      
      // Add rewards for level up
      const gemReward = newLevel * 100;
      const spinReward = Math.floor(newLevel / 2);
      
      const updatedUserLevel = {
        level: newLevel,
        xp: newXp,
        nextLevelXp,
        rakeback: Math.min(0.05 + (newLevel - 1) * 0.01, 0.25), // Max 25% rakeback
        rewards: {
          gems: userLevel.rewards.gems + gemReward,
          freeSpins: userLevel.rewards.freeSpins + spinReward,
        }
      };
      
      setUserLevel(updatedUserLevel);
      localStorage.setItem('userLevel', JSON.stringify(updatedUserLevel));
      
      // Add the gems to user balance
      const currentGems = parseInt(localStorage.getItem('userGems') || '0');
      localStorage.setItem('userGems', (currentGems + gemReward).toString());
      
      playSound(SOUNDS.LEVEL_UP);
      
      toast({
        title: 'Level up!',
        description: `You've reached level ${newLevel}! +${gemReward} gems, +${spinReward} free spins`,
        variant: 'default',
      });
    } else {
      const updatedUserLevel = {
        ...userLevel,
        xp: newXp,
      };
      
      setUserLevel(updatedUserLevel);
      localStorage.setItem('userLevel', JSON.stringify(updatedUserLevel));
    }
    
    setWager(newWager);
    localStorage.setItem('userWager', newWager.toString());
  };

  const claimRewards = () => {
    if (userLevel.rewards.gems > 0 || userLevel.rewards.freeSpins > 0) {
      // Reset rewards after claiming
      const updatedUserLevel = {
        ...userLevel,
        rewards: {
          gems: 0,
          freeSpins: 0,
        }
      };
      
      setUserLevel(updatedUserLevel);
      localStorage.setItem('userLevel', JSON.stringify(updatedUserLevel));
      
      playSound(SOUNDS.REWARD);
      
      toast({
        title: 'Rewards Claimed',
        description: 'Your rewards have been added to your account',
        variant: 'default',
      });
    } else {
      toast({
        title: 'No Rewards',
        description: 'You have no rewards to claim',
        variant: 'default',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Rewards & Affiliate</h1>
      
      <Tabs defaultValue={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="affiliate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2 h-5 w-5 text-primary" />
                  Enter Affiliate Code
                </CardTitle>
                <CardDescription>
                  Enter a friend's affiliate code to get 100 free gems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter code"
                    value={affiliateCode}
                    onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                    maxLength={8}
                  />
                  <Button onClick={handleEnterAffiliateCode}>Submit</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-primary" />
                  Your Affiliate Code
                </CardTitle>
                <CardDescription>
                  Share this code with friends to earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    value={userAffiliateCode}
                    readOnly
                  />
                  <Button variant="outline" onClick={copyAffiliateCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  You earn 10% of your referrals' first deposit
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                Level {userLevel.level}
              </CardTitle>
              <CardDescription>
                {userLevel.xp}/{userLevel.nextLevelXp} XP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(userLevel.xp / userLevel.nextLevelXp) * 100} className="h-2" />
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Rakeback</div>
                  <div className="text-xl font-bold">{(userLevel.rakeback * 100).toFixed(2)}%</div>
                </div>
                <div className="bg-muted rounded-md p-4">
                  <div className="text-sm text-muted-foreground">Total Wagered</div>
                  <div className="text-xl font-bold">{wager.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Rewards to Claim</h4>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <CircleDollarSign className="h-4 w-4 mr-1 text-primary" />
                    <span>{userLevel.rewards.gems} gems</span>
                  </div>
                  <div className="flex items-center">
                    <Gift className="h-4 w-4 mr-1 text-primary" />
                    <span>{userLevel.rewards.freeSpins} free spins</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={simulateLevelUp}>
                Simulate Wager (+500)
              </Button>
              <Button onClick={claimRewards} disabled={userLevel.rewards.gems === 0 && userLevel.rewards.freeSpins === 0}>
                Claim Rewards
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Level Benefits</CardTitle>
              <CardDescription>
                The more you play, the more you earn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div key={level} className={`p-3 rounded-md border ${userLevel.level >= level ? 'bg-muted/30 border-primary/50' : 'bg-muted/10 border-muted'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold flex items-center">
                          <Star className={`h-4 w-4 mr-1 ${userLevel.level >= level ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                          Level {level}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(0.05 + (level - 1) * 0.01).toFixed(2)}% Rakeback
                        </div>
                      </div>
                      <div className="text-sm">
                        {level * 100} gems <br/>
                        {Math.floor(level / 2)} free spins
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;
