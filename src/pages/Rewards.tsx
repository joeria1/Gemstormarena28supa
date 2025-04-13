
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gift, Clock, Gift as GiftIcon, Award, Gem, User, Ticket, ChevronRight } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import DailyFreeCase from '@/components/Rewards/DailyFreeCase';
import ChatWindow from '@/components/Chat/ChatWindow';

const Rewards: React.FC = () => {
  const { user, updateBalance } = useUser();

  const claimReward = (amount: number) => {
    if (!user) {
      toast.error('Please log in to claim rewards');
      return;
    }
    
    updateBalance(amount);
    toast.success(`Claimed ${amount} gems!`);
  };

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Rewards & Bonuses
          </h1>
          <p className="text-muted-foreground mt-2">
            Claim free rewards, bonuses and participate in special events
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6 w-full">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="promo">Promo Codes</TabsTrigger>
                <TabsTrigger value="rakeback">Rake Back</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="space-y-6">
                <DailyFreeCase />
                
                <Card className="bg-black/40 border-white/10 p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/20 p-2 rounded-full mr-3">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Hourly Rewards</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-black/30 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Active Time Bonus</p>
                        <p className="text-sm text-muted-foreground">50 gems every hour you're online</p>
                      </div>
                      <Button onClick={() => claimReward(50)} disabled={!user}>Claim</Button>
                    </div>
                    
                    <div className="bg-black/30 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Bet Milestone</p>
                        <p className="text-sm text-muted-foreground">100 gems for every 10 bets placed</p>
                      </div>
                      <Button onClick={() => claimReward(100)} disabled={!user}>Claim</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="promo">
                <Card className="bg-black/40 border-white/10 p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary/20 p-2 rounded-full mr-3">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Promo Codes</h3>
                  </div>
                  
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <Label className="mb-2 block">Enter Promo Code</Label>
                      <Input placeholder="Enter code here" className="bg-black/50" />
                    </div>
                    <Button className="self-end">Redeem</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Recently Redeemed</h4>
                    {user ? (
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <p className="text-sm text-center text-muted-foreground">You haven't redeemed any codes yet</p>
                      </div>
                    ) : (
                      <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                        <p className="text-sm text-center text-muted-foreground">Please log in to redeem promo codes</p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="rakeback">
                <Card className="bg-black/40 border-white/10 p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary/20 p-2 rounded-full mr-3">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Rake Back Rewards</h3>
                  </div>
                  
                  {user ? (
                    <>
                      <div className="bg-gradient-to-b from-blue-900/30 to-purple-900/30 rounded-xl p-6 mb-6 border border-white/5">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="bg-black/40 border border-white/10 rounded-lg p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-1">Total Bets</p>
                            <div className="text-2xl font-bold">
                              <Gem className="inline h-5 w-5 text-cyan-400 mr-2" />
                              {user.totalBets || 0}
                            </div>
                          </div>
                          
                          <div className="bg-black/40 border border-white/10 rounded-lg p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-1">Available Rake Back</p>
                            <div className="text-2xl font-bold">
                              <Gem className="inline h-5 w-5 text-cyan-400 mr-2" />
                              {Math.floor((user.totalBets || 0) * 0.05)}
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full btn-primary"
                          disabled={(user.totalBets || 0) === 0}
                          onClick={() => {
                            const rakebackAmount = Math.floor((user.totalBets || 0) * 0.05);
                            if (rakebackAmount > 0) {
                              updateBalance(rakebackAmount);
                              toast.success(`Claimed ${rakebackAmount} gems in rakeback!`);
                            }
                          }}
                        >
                          Claim Rake Back
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <h4 className="font-medium mb-2">How Rake Back Works:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>You earn 5% rake back on all your bets</li>
                          <li>Rake back is calculated based on your total bet amount</li>
                          <li>Claim anytime to receive your accumulated rake back as gems</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="bg-black/30 border border-white/10 rounded-lg p-8 text-center">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Please log in to view rake back</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Earn 5% rake back on all your bets and claim anytime
                      </p>
                      <Button>Log In to Continue</Button>
                    </div>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="events">
                <Card className="bg-black/40 border-white/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-primary/20 p-2 rounded-full mr-3">
                        <GiftIcon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">Special Events</h3>
                    </div>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Weekend Double Up</h4>
                          <p className="text-sm text-muted-foreground">Double your rewards on all games</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Mega Rain Event</h4>
                          <p className="text-sm text-muted-foreground">10x gems in chat rain events</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">Referral Bonus</h4>
                          <p className="text-sm text-muted-foreground">Earn 500 gems for each referral</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="col-span-1">
            <ChatWindow className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
