import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, User, Award, Trophy, BarChart3, History, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSettings from './ProfileSettings';

interface FullProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullProfileView: React.FC<FullProfileViewProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate progress for the XP bar
  const level = user.level || 1;
  const xp = user.xp || 0;
  const xpRequired = level * 1000; // Simple calculation for required XP
  const progress = Math.min((xp / xpRequired) * 100, 100);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
        <motion.div 
          className="relative w-full max-w-6xl mx-4 bg-gray-900 rounded-lg shadow-2xl border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">Your Profile</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column - User Info */}
              <div className="w-full md:w-1/3 space-y-6">
                <Card className="bg-gray-800 border-none shadow-lg p-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-blue-600">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-1">{user.username}</h3>
                    <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full text-xs">Level {level}</span>
                    
                    <div className="w-full mt-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span>XP Progress</span>
                        <span>{xp} / {xpRequired}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full mt-6 text-center">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Balance</div>
                        <div className="font-bold text-lg">${user.balance.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Wagered</div>
                        <div className="font-bold text-lg">${user.wagered?.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <ProfileSettings />
              </div>
              
              {/* Right Column - Tabs Content */}
              <div className="w-full md:w-2/3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full bg-gray-800 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rewards">Level Rewards</TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    <TabsTrigger value="history">Game History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <Card className="bg-gray-800 border-none shadow-lg p-6">
                      <h3 className="text-lg font-bold mb-4">Account Overview</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-900/50 rounded-full mx-auto mb-2">
                            <Trophy className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="text-xs text-gray-400">Wins</div>
                          <div className="font-bold">{user.wins || 0}</div>
                        </div>
                        
                        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-900/50 rounded-full mx-auto mb-2">
                            <DollarSign className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="text-xs text-gray-400">Profit</div>
                          <div className="font-bold">$0.00</div>
                        </div>
                        
                        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                          <div className="flex items-center justify-center w-10 h-10 bg-purple-900/50 rounded-full mx-auto mb-2">
                            <Share2 className="h-5 w-5 text-purple-400" />
                          </div>
                          <div className="text-xs text-gray-400">Referrals</div>
                          <div className="font-bold">{user.referrals || 0}</div>
                        </div>
                        
                        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                          <div className="flex items-center justify-center w-10 h-10 bg-yellow-900/50 rounded-full mx-auto mb-2">
                            <Award className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="text-xs text-gray-400">Rank</div>
                          <div className="font-bold">Silver</div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-gray-800 border-none shadow-lg p-6">
                      <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <div>
                            <div className="font-medium">Won Mines Game</div>
                            <div className="text-xs text-gray-400">2 hours ago</div>
                          </div>
                          <div className="text-green-400 font-medium">+$250.00</div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <div>
                            <div className="font-medium">Claimed Daily Reward</div>
                            <div className="text-xs text-gray-400">Yesterday</div>
                          </div>
                          <div className="text-green-400 font-medium">+$50.00</div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <div>
                            <div className="font-medium">Lost Blackjack Game</div>
                            <div className="text-xs text-gray-400">Yesterday</div>
                          </div>
                          <div className="text-red-400 font-medium">-$100.00</div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="rewards" className="space-y-6">
                    <Card className="bg-gray-800 border-none shadow-lg p-6">
                      <h3 className="text-lg font-bold mb-4">Level Rewards</h3>
                      <p className="text-gray-400 text-sm mb-6">Earn rewards as you level up your account</p>
                      
                      <div className="space-y-4">
                        {[
                          { level: 5, reward: "Mystery Box", claimed: level >= 5 },
                          { level: 10, reward: "$10.00 Bonus", claimed: level >= 10 },
                          { level: 15, reward: "Premium Case", claimed: level >= 15 },
                          { level: 20, reward: "$25.00 Bonus", claimed: level >= 20 },
                          { level: 25, reward: "Exclusive Case", claimed: level >= 25 },
                          { level: 30, reward: "$50.00 Bonus", claimed: level >= 30 },
                        ].map((reward, index) => (
                          <div 
                            key={index}
                            className={`flex justify-between items-center p-4 rounded-lg ${reward.claimed 
                              ? 'bg-green-900/20 border border-green-500/30' 
                              : 'bg-gray-700/50'}`}
                          >
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                reward.claimed ? 'bg-green-900/50 text-green-400' : 'bg-gray-600 text-white'
                              }`}>
                                {reward.level}
                              </div>
                              <div>
                                <div className="font-medium">{reward.reward}</div>
                                <div className="text-xs text-gray-400">Reach Level {reward.level}</div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              disabled={!reward.claimed || level < reward.level}
                              className={reward.claimed ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {level >= reward.level ? "Claim" : "Locked"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="statistics" className="space-y-6">
                    <Card className="bg-gray-800 border-none shadow-lg p-6">
                      <h3 className="text-lg font-bold mb-4">Game Statistics</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Win Rate</span>
                            <span className="text-sm">48%</span>
                          </div>
                          <Progress value={48} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Games Played</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span>Mines</span>
                                <span className="font-medium">56</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span>Blackjack</span>
                                <span className="font-medium">42</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span>Case Battles</span>
                                <span className="font-medium">23</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span>Crash</span>
                                <span className="font-medium">18</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Performance</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span>Total Bets</span>
                                <span className="font-medium">139</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span>Win Streak</span>
                                <span className="font-medium">6</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span>Biggest Win</span>
                                <span className="font-medium text-green-400">$1,250.00</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                <span>Profit/Loss</span>
                                <span className="font-medium text-green-400">+$350.25</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-6">
                    <Card className="bg-gray-800 border-none shadow-lg p-6">
                      <h3 className="text-lg font-bold mb-4">Game History</h3>
                      
                      <div className="space-y-4">
                        {[...Array(5)].map((_, index) => (
                          <div 
                            key={index} 
                            className="p-4 rounded-lg bg-gray-700/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                  index % 2 === 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                                }`}>
                                  {index % 2 === 0 ? <DollarSign className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                </div>
                                <div className="font-medium">{
                                  ['Mines', 'Blackjack', 'Case Opening', 'Crash', 'Tower'][index]
                                }</div>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {['2 hours ago', '5 hours ago', 'Yesterday', '2 days ago', '3 days ago'][index]}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:items-end">
                              <div className={`font-medium ${index % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {index % 2 === 0 ? `+$${(Math.random() * 500 + 50).toFixed(2)}` : `-$${(Math.random() * 200 + 25).toFixed(2)}`}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Bet: ${(Math.random() * 200 + 10).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4">
                        View More
                      </Button>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FullProfileView;
