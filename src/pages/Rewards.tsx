import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'framer-motion';
import { Gift, Trophy, DollarSign, Clock, Check, ChevronRight, Calendar, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import DailyFreeCase from '../components/Rewards/DailyFreeCase';

const Rewards = () => {
  const { user, updateUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('daily');
  
  // Daily rewards data
  const dailyRewards = [
    { day: 1, reward: 50, type: 'coins', claimed: true },
    { day: 2, reward: 100, type: 'coins', claimed: true },
    { day: 3, reward: 200, type: 'coins', claimed: false },
    { day: 4, reward: 300, type: 'coins', claimed: false },
    { day: 5, reward: 500, type: 'coins', claimed: false },
    { day: 6, reward: 1000, type: 'coins', claimed: false },
    { day: 7, reward: 2000, type: 'coins', claimed: false },
  ];
  
  // Level rewards data
  const levelRewards = [
    { level: 1, reward: 100, type: 'coins', claimed: true },
    { level: 2, reward: 200, type: 'coins', claimed: true },
    { level: 3, reward: 300, type: 'coins', claimed: false },
    { level: 5, reward: 500, type: 'coins', claimed: false },
    { level: 10, reward: 1000, type: 'coins', claimed: false },
    { level: 15, reward: 2000, type: 'coins', claimed: false },
    { level: 20, reward: 5000, type: 'coins', claimed: false },
  ];
  
  // Special events
  const events = [
    { 
      id: 1, 
      name: 'Weekend Bonus', 
      description: 'Get 2x XP on all games during the weekend!',
      active: true,
      endsIn: '2d 5h',
      image: '/placeholder.svg' 
    },
    { 
      id: 2, 
      name: 'Refer-a-Friend', 
      description: 'Get $10 for each friend you refer who deposits',
      active: true,
      endsIn: 'Permanent',
      image: '/placeholder.svg' 
    },
    { 
      id: 3, 
      name: 'Loyalty Points', 
      description: 'Earn 1 point for every $10 wagered',
      active: true,
      endsIn: 'Permanent',
      image: '/placeholder.svg' 
    },
  ];
  
  const handleClaimReward = (day: number) => {
    const reward = dailyRewards.find(r => r.day === day);
    if (reward && !reward.claimed) {
      updateUser({
        ...user,
        balance: user.balance + reward.reward
      });
      
      toast.success(`You claimed $${reward.reward}!`);
    }
  };
  
  const handleClaimLevelReward = (level: number) => {
    const reward = levelRewards.find(r => r.level === level);
    if (reward && !reward.claimed && user.level >= level) {
      updateUser({
        ...user,
        balance: user.balance + reward.reward
      });
      
      toast.success(`You claimed $${reward.reward} for reaching level ${level}!`);
    } else if (user.level < level) {
      toast.error(`You need to reach level ${level} first!`);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-8">
        <Gift className="w-8 h-8 text-green-500 mr-2" />
        <h1 className="text-2xl font-bold">Rewards</h1>
      </div>
      
      {/* Daily Free Case Section */}
      <div className="mb-8">
        <Card className="bg-gray-900 border-none shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Daily Free Case</h2>
          <div className="flex justify-center">
            <DailyFreeCase />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <div className="md:col-span-5">
          <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-gray-800 mb-6">
              <TabsTrigger value="daily" className="flex-1">Daily Rewards</TabsTrigger>
              <TabsTrigger value="level" className="flex-1">Level Rewards</TabsTrigger>
              <TabsTrigger value="events" className="flex-1">Special Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily">
              <Card className="bg-gray-900 border-none shadow-lg p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">Daily Login Rewards</h2>
                  <p className="text-gray-400 text-sm mt-1">Log in every day to claim your rewards!</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {dailyRewards.map((reward) => (
                    <motion.div 
                      key={reward.day}
                      whileHover={{ scale: 1.05 }}
                      className={`bg-gray-800 rounded-lg overflow-hidden border ${
                        reward.claimed 
                          ? 'border-green-500' 
                          : 'border-gray-700'
                      }`}
                    >
                      <div className="bg-gray-800 p-2 text-center">
                        <div className="text-xs text-gray-400">Day</div>
                        <div className="text-lg font-bold">{reward.day}</div>
                      </div>
                      
                      <div className="p-4 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-900 mb-2 flex items-center justify-center">
                          {reward.type === 'coins' && <DollarSign className="h-6 w-6 text-yellow-500" />}
                        </div>
                        <div className="font-bold text-center">{reward.reward}</div>
                        <div className="text-xs text-gray-400 mb-2">
                          {reward.type === 'coins' ? 'coins' : reward.type}
                        </div>
                        
                        {reward.claimed ? (
                          <div className="bg-green-900 text-green-400 px-3 py-1 rounded-full text-xs flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Claimed
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1"
                            onClick={() => handleClaimReward(reward.day)}
                          >
                            Claim
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="level">
              <Card className="bg-gray-900 border-none shadow-lg p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">Level Rewards</h2>
                  <p className="text-gray-400 text-sm mt-1">Earn rewards as you level up!</p>
                </div>
                
                <div className="space-y-4">
                  {levelRewards.map((reward) => (
                    <motion.div 
                      key={reward.level}
                      whileHover={{ scale: 1.01 }}
                      className={`bg-gray-800 rounded-lg p-4 flex items-center justify-between ${
                        user.level >= reward.level 
                          ? (reward.claimed ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500') 
                          : 'border-l-4 border-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-900 mr-4 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <div className="font-bold">Level {reward.level}</div>
                          <div className="text-sm text-gray-400">{reward.reward} coins</div>
                        </div>
                      </div>
                      
                      <div>
                        {reward.claimed ? (
                          <div className="bg-green-900 text-green-400 px-3 py-1 rounded-full text-xs flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Claimed
                          </div>
                        ) : user.level >= reward.level ? (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1"
                            onClick={() => handleClaimLevelReward(reward.level)}
                          >
                            Claim
                          </Button>
                        ) : (
                          <div className="bg-gray-700 text-gray-400 px-3 py-1 rounded-full text-xs flex items-center">
                            <Lock className="h-3 w-3 mr-1" />
                            Level {reward.level} Required
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="events">
              <Card className="bg-gray-900 border-none shadow-lg p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">Special Events</h2>
                  <p className="text-gray-400 text-sm mt-1">Limited-time events and offers!</p>
                </div>
                
                <div className="space-y-4">
                  {events.map((event) => (
                    <motion.div 
                      key={event.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gray-800 rounded-lg overflow-hidden flex flex-col sm:flex-row"
                    >
                      <div className="sm:w-1/4 bg-gray-700">
                        <img 
                          src={event.image} 
                          alt={event.name} 
                          className="w-full h-full object-cover" 
                          style={{ maxHeight: '150px' }}
                        />
                      </div>
                      <div className="p-4 sm:w-3/4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold">{event.name}</h3>
                            {event.active && (
                              <div className="bg-green-900 text-green-400 px-2 py-0.5 rounded-full text-xs">
                                Active
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{event.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            Ends in: {event.endsIn}
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-700"
                          >
                            Details <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-2">
          <Card className="bg-gray-900 border-none shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-bold">Your Progress</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-600 mr-4">
                  <img 
                    src={user.avatar || "https://api.dicebear.com/7.x/lorelei/svg?seed=user"} 
                    alt={user.username} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold">{user.username}</div>
                  <div className="text-sm text-gray-400">Level {user.level || 1}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                  <span>XP Progress</span>
                  <span>{user.xp || 0}/{(user.level || 1) * 1000}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-green-500"
                    style={{ width: `${Math.min(((user.xp || 0) / ((user.level || 1) * 1000)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm">Daily Streak</span>
                  </div>
                  <span className="font-bold">2 days</span>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Total Wagered</span>
                  </div>
                  <span className="font-bold">${(user.wagered || 0).toFixed(2)}</span>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm">Total Wins</span>
                  </div>
                  <span className="font-bold">{user.wins || 0}</span>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm">Referrals</span>
                  </div>
                  <span className="font-bold">{user.referrals || 0}</span>
                </div>
              </div>
              
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                View Full Profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Missing icon used in the page
const Lock = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export default Rewards;
