
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, Users, Flame, BarChart3, Award } from 'lucide-react';
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface FullProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    username: string;
    avatarUrl: string;
    level: number;
    xp: number;
    joinDate: string;
    totalWagered: number;
    totalWon: number;
    referrals: number;
    rank: string;
    winRate: number;
    achievements: number;
    recentActivity: Array<{
      id: number;
      date: string;
      type: string;
      game: string;
      outcome: 'win' | 'loss';
      amount: number;
    }>;
    stats: {
      gamesPlayed: number;
      highestWin: number;
      favoriteGame: string;
    };
  };
}

const FullProfileModal: React.FC<FullProfileModalProps> = ({ isOpen, onClose, userData }) => {
  if (!isOpen) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-900 p-6 flex justify-between items-start border-b border-gray-700">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
                  {userData.avatarUrl ? (
                    <img src={userData.avatarUrl} alt={userData.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <Users size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* User info */}
                <div>
                  <h2 className="text-2xl font-bold text-white">{userData.username}</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <Star size={14} className="text-yellow-400" />
                    <span className="text-gray-300">Level {userData.level}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-300">Joined {formatDate(userData.joinDate)}</span>
                  </div>
                </div>
              </div>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="text-sm text-gray-400">Total Won</span>
                  </div>
                  <div className="text-lg font-bold text-white">${userData.totalWon.toLocaleString()}</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame size={16} className="text-orange-400" />
                    <span className="text-sm text-gray-400">Wagered</span>
                  </div>
                  <div className="text-lg font-bold text-white">${userData.totalWagered.toLocaleString()}</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-blue-400" />
                    <span className="text-sm text-gray-400">Referrals</span>
                  </div>
                  <div className="text-lg font-bold text-white">{userData.referrals}</div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={16} className="text-purple-400" />
                    <span className="text-sm text-gray-400">Rank</span>
                  </div>
                  <div className="text-lg font-bold text-white">{userData.rank}</div>
                </div>
              </div>
              
              {/* Tabs */}
              <Tabs defaultValue="activity">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                  <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
                  <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                    
                    {userData.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {userData.recentActivity.map((activity) => (
                          <div 
                            key={activity.id}
                            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300">{activity.game}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-sm text-gray-400">{formatDate(activity.date)}</span>
                              </div>
                              <div className="text-sm text-gray-400">{activity.type}</div>
                            </div>
                            <div className={`font-bold ${activity.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                              {activity.outcome === 'win' ? '+' : '-'}${activity.amount.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No recent activity to display.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="stats">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Game Statistics</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 size={16} className="text-blue-400" />
                          <span className="text-sm text-gray-400">Games Played</span>
                        </div>
                        <div className="text-lg font-bold text-white">{userData.stats.gamesPlayed}</div>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy size={16} className="text-yellow-400" />
                          <span className="text-sm text-gray-400">Highest Win</span>
                        </div>
                        <div className="text-lg font-bold text-white">${userData.stats.highestWin.toLocaleString()}</div>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame size={16} className="text-orange-400" />
                          <span className="text-sm text-gray-400">Favorite Game</span>
                        </div>
                        <div className="text-lg font-bold text-white">{userData.stats.favoriteGame}</div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-white mb-2">Win Rate</h4>
                      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${userData.winRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-400">Win Rate</span>
                        <span className="text-sm font-medium text-green-400">{userData.winRate}%</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Achievements</h3>
                      <div className="px-2 py-1 bg-purple-600 rounded text-sm font-medium text-white">
                        {userData.achievements} / 20
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sample achievements */}
                      <div className="bg-gray-800 p-4 rounded-lg border border-yellow-500/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <Trophy size={20} className="text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">First Win</h4>
                            <p className="text-sm text-gray-400">Win your first game</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg border border-blue-500/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Users size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">Social Butterfly</h4>
                            <p className="text-sm text-gray-400">Refer 3 friends</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <Flame size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-400">High Roller</h4>
                            <p className="text-sm text-gray-500">Wager $10,000 in total</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <Award size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-400">Diamond Status</h4>
                            <p className="text-sm text-gray-500">Reach level 25</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FullProfileModal;
