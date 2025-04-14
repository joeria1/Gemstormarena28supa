
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, User, Award, Trophy, BarChart3, History, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import FullProfileView from '../components/Profile/FullProfileView';
import ProfileSettings from '../components/Profile/ProfileSettings';

const Profile = () => {
  const { user } = useUser();
  const [showFullProfile, setShowFullProfile] = useState(false);
  
  // Calculate progress for the XP bar
  const level = user.level || 1;
  const xp = user.xp || 0;
  const xpRequired = level * 1000; // Simple calculation for required XP
  const progress = Math.min((xp / xpRequired) * 100, 100);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-none shadow-lg text-white p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24 border-2 border-blue-500">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                
                <div className="mt-4 bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium">Level {level}</span>
                    </div>
                    <span className="text-xs text-gray-400">{xp}/{xpRequired} XP</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-gray-700" />
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Balance</div>
                      <div className="flex items-center justify-center text-lg font-bold">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        {user.balance.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Wagered</div>
                      <div className="flex items-center justify-center text-lg font-bold">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        {user.wagered?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Wins</div>
                      <div className="flex items-center justify-center text-lg font-bold">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        {user.wins || 0}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Referrals</div>
                      <div className="flex items-center justify-center text-lg font-bold">
                        <Share2 className="w-4 h-4 text-purple-500" />
                        {user.referrals || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="bg-gray-900 border-none shadow-lg text-white p-6">
              <div className="flex items-center mb-4">
                <History className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-bold">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">Mines Game</div>
                    <div className="text-xs text-gray-400">2 hours ago</div>
                  </div>
                  <div className="text-green-500 font-medium">+$250.00</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">Daily Case</div>
                    <div className="text-xs text-gray-400">Yesterday</div>
                  </div>
                  <div className="text-green-500 font-medium">+$50.00</div>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">Blackjack Game</div>
                    <div className="text-xs text-gray-400">Yesterday</div>
                  </div>
                  <div className="text-red-500 font-medium">-$100.00</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gray-900 border-none shadow-lg text-white p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-bold">Statistics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="font-medium">48%</span>
                </div>
                <Progress value={48} className="h-2 bg-gray-700" />
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-400">Favorite Game</span>
                  <span className="font-medium">Mines</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Bets</span>
                  <span className="font-medium">142</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Biggest Win</span>
                  <span className="font-medium text-green-500">$1,250.00</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Profit/Loss</span>
                  <span className="font-medium text-green-500">+$350.25</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div>
          <Card className="bg-gray-900 border-none shadow-lg text-white p-6 mb-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-cyan-500 mr-2" />
              <h3 className="text-lg font-bold">Account</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Username</div>
                <div className="bg-gray-800 p-2 rounded">{user.username}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">User ID</div>
                <div className="bg-gray-800 p-2 rounded text-sm font-mono">{user.id}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Account Type</div>
                <div className="bg-gray-800 p-2 rounded">Standard</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Member Since</div>
                <div className="bg-gray-800 p-2 rounded">2024-03-15</div>
              </div>
              
              <Separator className="bg-gray-700 my-4" />
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowFullProfile(true)}
              >
                View Full Profile
              </Button>
            </div>
          </Card>
          
          <Card className="bg-gray-900 border-none shadow-lg text-white p-6">
            <div className="flex items-center mb-4">
              <Award className="w-5 h-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-bold">Level Rewards</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-green-800 text-green-300 w-8 h-8 rounded-full flex items-center justify-center mr-3">5</div>
                  <div>
                    <div className="font-medium">Mystery Box</div>
                    <div className="text-xs text-gray-400">Reach Level 5</div>
                  </div>
                </div>
                <Button size="sm" disabled={level < 5} className="text-xs">Claim</Button>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-blue-800 text-blue-300 w-8 h-8 rounded-full flex items-center justify-center mr-3">10</div>
                  <div>
                    <div className="font-medium">$10 Bonus</div>
                    <div className="text-xs text-gray-400">Reach Level 10</div>
                  </div>
                </div>
                <Button size="sm" disabled={level < 10} className="text-xs">Claim</Button>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-purple-800 text-purple-300 w-8 h-8 rounded-full flex items-center justify-center mr-3">25</div>
                  <div>
                    <div className="font-medium">Exclusive Case</div>
                    <div className="text-xs text-gray-400">Reach Level 25</div>
                  </div>
                </div>
                <Button size="sm" disabled={level < 25} className="text-xs">Claim</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Full Profile Modal */}
      <FullProfileView isOpen={showFullProfile} onClose={() => setShowFullProfile(false)} />
    </div>
  );
};

export default Profile;
