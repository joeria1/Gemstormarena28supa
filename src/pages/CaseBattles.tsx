
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sword, Users, Plus, DollarSign, Clock, Trophy, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ImprovedCaseBattleCreator from '../components/CaseBattle/ImprovedCaseBattleCreator';
import ImprovedCaseBattleGame from '../components/CaseBattle/ImprovedCaseBattleGame';

interface Battle {
  id: string;
  creator: {
    username: string;
    avatar: string;
  };
  mode: '1v1' | '2v2' | '1v1v1' | '1v1v1v1';
  totalValue: number;
  cases: number;
  players: {
    username: string;
    avatar: string;
    team: number;
  }[];
  status: 'waiting' | 'in-progress' | 'completed';
  createdAt: Date;
  winnerId?: string;
}

const CaseBattles = () => {
  const { user, updateUser } = useContext(UserContext);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [isCreatingBattle, setIsCreatingBattle] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Mock data for battles
    const mockBattles: Battle[] = [
      {
        id: '1',
        creator: {
          username: 'CryptoKing',
          avatar: 'https://i.pravatar.cc/150?img=1',
        },
        mode: '1v1',
        totalValue: 45.50,
        cases: 2,
        players: [
          {
            username: 'CryptoKing',
            avatar: 'https://i.pravatar.cc/150?img=1',
            team: 1,
          }
        ],
        status: 'waiting',
        createdAt: new Date(Date.now() - 300000),
      },
      {
        id: '2',
        creator: {
          username: 'GambleGod',
          avatar: 'https://i.pravatar.cc/150?img=4',
        },
        mode: '2v2',
        totalValue: 120.75,
        cases: 4,
        players: [
          {
            username: 'GambleGod',
            avatar: 'https://i.pravatar.cc/150?img=4',
            team: 1,
          },
          {
            username: 'LuckyPlayer',
            avatar: 'https://i.pravatar.cc/150?img=5',
            team: 1,
          },
          {
            username: 'BetMaster',
            avatar: 'https://i.pravatar.cc/150?img=6',
            team: 2,
          }
        ],
        status: 'waiting',
        createdAt: new Date(Date.now() - 120000),
      },
      {
        id: '3',
        creator: {
          username: 'HighRoller',
          avatar: 'https://i.pravatar.cc/150?img=7',
        },
        mode: '1v1v1',
        totalValue: 75.25,
        cases: 3,
        players: [
          {
            username: 'HighRoller',
            avatar: 'https://i.pravatar.cc/150?img=7',
            team: 1,
          },
          {
            username: 'CasinoWhale',
            avatar: 'https://i.pravatar.cc/150?img=8',
            team: 2,
          },
          {
            username: 'GamblingPro',
            avatar: 'https://i.pravatar.cc/150?img=9',
            team: 3,
          }
        ],
        status: 'in-progress',
        createdAt: new Date(Date.now() - 60000),
      },
      {
        id: '4',
        creator: {
          username: 'SlotKing',
          avatar: 'https://i.pravatar.cc/150?img=10',
        },
        mode: '1v1',
        totalValue: 50.00,
        cases: 2,
        players: [
          {
            username: 'SlotKing',
            avatar: 'https://i.pravatar.cc/150?img=10',
            team: 1,
          },
          {
            username: 'RouletteMaster',
            avatar: 'https://i.pravatar.cc/150?img=11',
            team: 2,
          }
        ],
        status: 'completed',
        createdAt: new Date(Date.now() - 30000),
        winnerId: 'SlotKing',
      }
    ];
    
    setBattles(mockBattles);
  }, []);

  const handleCreateBattle = (battleDetails: any) => {
    if (user.balance < battleDetails.totalCost) {
      toast.error("Insufficient balance!");
      return;
    }

    // Deduct the cost from the user's balance
    updateUser({
      ...user,
      balance: user.balance - battleDetails.totalCost
    });

    const newBattle: Battle = {
      id: Date.now().toString(),
      creator: {
        username: user.username || 'Anonymous',
        avatar: user.avatar || 'https://i.pravatar.cc/150?img=3',
      },
      mode: battleDetails.mode,
      totalValue: battleDetails.totalCost,
      cases: battleDetails.cases.length,
      players: [
        {
          username: user.username || 'Anonymous',
          avatar: user.avatar || 'https://i.pravatar.cc/150?img=3',
          team: 1,
        }
      ],
      status: 'waiting',
      createdAt: new Date(),
    };
    
    setBattles([newBattle, ...battles]);
    setIsCreatingBattle(false);
    toast.success("Battle created successfully!");
  };

  const handleJoinBattle = (battleId: string) => {
    const battle = battles.find(b => b.id === battleId);
    if (!battle) return;
    
    // Check if the user has enough balance
    const costPerPlayer = battle.totalValue / battle.mode.split('v').length;
    if (user.balance < costPerPlayer) {
      toast.error("Insufficient balance!");
      return;
    }

    // Deduct the cost from the user's balance
    updateUser({
      ...user,
      balance: user.balance - costPerPlayer
    });
    
    // Get the next available team
    const teams = battle.players.map(p => p.team);
    const availableTeams = Array.from({ length: battle.mode.split('v').length }, (_, i) => i + 1)
      .filter(team => !teams.includes(team));
    
    const nextTeam = availableTeams.length > 0 ? availableTeams[0] : 1;
    
    // Add the user to the battle
    const updatedBattle = {
      ...battle,
      players: [
        ...battle.players,
        {
          username: user.username || 'Anonymous',
          avatar: user.avatar || 'https://i.pravatar.cc/150?img=3',
          team: nextTeam,
        }
      ]
    };
    
    // Check if the battle is now full
    const requiredPlayers = battle.mode.split('v').length;
    const isFull = updatedBattle.players.length === requiredPlayers;
    
    // Update the battle status if it's full
    const finalBattle = {
      ...updatedBattle,
      status: isFull ? 'in-progress' : 'waiting'
    };
    
    // Update the battles list
    setBattles(battles.map(b => b.id === battleId ? finalBattle : b));
    
    // If the battle is now full, simulate the battle outcome after a delay
    if (isFull) {
      setActiveBattle(finalBattle);
      toast.success("Battle starting!");
      
      // After battle simulation is complete...
      setTimeout(() => {
        const randomWinnerIndex = Math.floor(Math.random() * finalBattle.players.length);
        const winner = finalBattle.players[randomWinnerIndex];
        
        // Calculate winnings (everyone's contribution minus a small fee)
        const winnings = finalBattle.totalValue * 0.95;
        
        // If the current user is the winner, update their balance
        if (winner.username === user.username) {
          updateUser({
            ...user,
            balance: user.balance + winnings
          });
          toast.success(`You won $${winnings.toFixed(2)}!`);
        }
        
        // Update the battle with the winner
        const completedBattle = {
          ...finalBattle,
          status: 'completed',
          winnerId: winner.username
        };
        
        // Update the battles list
        setBattles(battles.map(b => b.id === battleId ? completedBattle : b));
        
        setTimeout(() => {
          setActiveBattle(null);
        }, 5000); // Close the battle view after 5 seconds
      }, 10000); // Run for 10 seconds
    } else {
      toast.success("Joined battle successfully!");
    }
  };

  const handleViewBattle = (battle: Battle) => {
    setActiveBattle(battle);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {activeBattle ? (
        <ImprovedCaseBattleGame 
          battle={activeBattle} 
          onClose={() => setActiveBattle(null)} 
          currentUser={user.username || 'Anonymous'}
        />
      ) : isCreatingBattle ? (
        <ImprovedCaseBattleCreator 
          onCreateBattle={handleCreateBattle} 
          onCancel={() => setIsCreatingBattle(false)}
          userBalance={user.balance}
        />
      ) : (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center">
              <Sword className="w-8 h-8 text-green-500 mr-2" />
              <h1 className="text-2xl font-bold">Case Battles</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 p-2 rounded-lg flex items-center">
                <DollarSign className="text-yellow-500 w-5 h-5 mr-1" />
                <span className="text-white font-bold">${user.balance.toFixed(2)}</span>
              </div>
              <Button 
                onClick={() => setIsCreatingBattle(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-1" />
                Create Battle
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-gray-800 mb-6">
              <TabsTrigger value="all" className="flex-1">All Battles</TabsTrigger>
              <TabsTrigger value="my" className="flex-1">My Battles</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {battles.filter(b => b.status !== 'completed').map(battle => (
                  <motion.div 
                    key={battle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gray-900 border-none shadow-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-800">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded">
                              {battle.mode}
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.floor((Date.now() - battle.createdAt.getTime()) / 60000)} min ago
                            </div>
                          </div>
                          <div className="flex items-center text-yellow-500 font-bold">
                            <DollarSign className="h-4 w-4" />
                            {battle.totalValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-800">
                              <img 
                                src={battle.creator.avatar} 
                                alt={battle.creator.username}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{battle.creator.username}</p>
                              <p className="text-xs text-gray-400">Creator</p>
                            </div>
                          </div>
                          <div className="bg-gray-800 px-2 py-1 rounded flex items-center">
                            <Users className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="text-xs">
                              {battle.players.length}/{battle.mode.split('v').length}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {battle.mode.split('v').map((_, teamIndex) => {
                            const teamPlayers = battle.players.filter(p => p.team === teamIndex + 1);
                            const isTeamFull = teamPlayers.length >= 1;
                            
                            return (
                              <div key={teamIndex} className="bg-gray-800 p-2 rounded">
                                <p className="text-xs text-gray-400 mb-1">Team {teamIndex + 1}</p>
                                {isTeamFull ? (
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-700">
                                      <img 
                                        src={teamPlayers[0].avatar} 
                                        alt={teamPlayers[0].username}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <p className="text-sm truncate">{teamPlayers[0].username}</p>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 opacity-50">
                                    <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center">
                                      <User className="h-3 w-3" />
                                    </div>
                                    <p className="text-sm">Waiting...</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Cases</p>
                            <p className="text-sm font-medium">{battle.cases} items</p>
                          </div>
                          
                          {battle.status === 'waiting' && battle.players.every(p => p.username !== user.username) && (
                            <Button 
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                              onClick={() => handleJoinBattle(battle.id)}
                            >
                              Join Battle
                            </Button>
                          )}
                          
                          {battle.status === 'in-progress' && (
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700"
                              size="sm"
                              onClick={() => handleViewBattle(battle)}
                            >
                              Watch
                            </Button>
                          )}
                          
                          {battle.status === 'waiting' && battle.players.some(p => p.username === user.username) && (
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700"
                              size="sm"
                              disabled
                            >
                              Waiting...
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                
                {battles.filter(b => b.status !== 'completed').length === 0 && (
                  <div className="col-span-3 text-center py-10">
                    <Trophy className="mx-auto h-10 w-10 text-gray-500 mb-2" />
                    <p className="text-gray-500">No battles available. Create one!</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="my">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {battles.filter(b => 
                  b.players.some(p => p.username === user.username) && 
                  b.status !== 'completed'
                ).map(battle => (
                  <motion.div 
                    key={battle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gray-900 border-none shadow-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-800">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded">
                              {battle.mode}
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.floor((Date.now() - battle.createdAt.getTime()) / 60000)} min ago
                            </div>
                          </div>
                          <div className="flex items-center text-yellow-500 font-bold">
                            <DollarSign className="h-4 w-4" />
                            {battle.totalValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-800">
                              <img 
                                src={battle.creator.avatar} 
                                alt={battle.creator.username}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{battle.creator.username}</p>
                              <p className="text-xs text-gray-400">Creator</p>
                            </div>
                          </div>
                          <div className="bg-gray-800 px-2 py-1 rounded flex items-center">
                            <Users className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="text-xs">
                              {battle.players.length}/{battle.mode.split('v').length}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {battle.mode.split('v').map((_, teamIndex) => {
                            const teamPlayers = battle.players.filter(p => p.team === teamIndex + 1);
                            const isTeamFull = teamPlayers.length >= 1;
                            
                            return (
                              <div 
                                key={teamIndex} 
                                className={`bg-gray-800 p-2 rounded ${
                                  teamPlayers.some(p => p.username === user.username) ? 'ring-2 ring-green-500' : ''
                                }`}
                              >
                                <p className="text-xs text-gray-400 mb-1">Team {teamIndex + 1}</p>
                                {isTeamFull ? (
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-700">
                                      <img 
                                        src={teamPlayers[0].avatar} 
                                        alt={teamPlayers[0].username}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <p className="text-sm truncate">{teamPlayers[0].username}</p>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 opacity-50">
                                    <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center">
                                      <User className="h-3 w-3" />
                                    </div>
                                    <p className="text-sm">Waiting...</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Cases</p>
                            <p className="text-sm font-medium">{battle.cases} items</p>
                          </div>
                          
                          {battle.status === 'in-progress' && (
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700"
                              size="sm"
                              onClick={() => handleViewBattle(battle)}
                            >
                              Watch
                            </Button>
                          )}
                          
                          {battle.status === 'waiting' && (
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700"
                              size="sm"
                              disabled
                            >
                              Waiting...
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                
                {battles.filter(b => 
                  b.players.some(p => p.username === user.username) && 
                  b.status !== 'completed'
                ).length === 0 && (
                  <div className="col-span-3 text-center py-10">
                    <Trophy className="mx-auto h-10 w-10 text-gray-500 mb-2" />
                    <p className="text-gray-500">You haven't joined any battles yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {battles.filter(b => b.status === 'completed').map(battle => (
                  <motion.div 
                    key={battle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gray-900 border-none shadow-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-800">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded">
                              {battle.mode}
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.floor((Date.now() - battle.createdAt.getTime()) / 60000)} min ago
                            </div>
                          </div>
                          <div className="flex items-center text-yellow-500 font-bold">
                            <DollarSign className="h-4 w-4" />
                            {battle.totalValue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-800">
                              <img 
                                src={battle.creator.avatar} 
                                alt={battle.creator.username}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{battle.creator.username}</p>
                              <p className="text-xs text-gray-400">Creator</p>
                            </div>
                          </div>
                          <div className="bg-green-900 px-2 py-1 rounded flex items-center">
                            <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                            <span className="text-xs font-bold">
                              {battle.winnerId}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {battle.players.map((player, index) => (
                            <div 
                              key={index} 
                              className={`bg-gray-800 p-2 rounded ${
                                player.username === battle.winnerId ? 'bg-green-900' : 
                                (player.username === user.username ? 'ring-2 ring-red-500' : '')
                              }`}
                            >
                              <p className="text-xs text-gray-400 mb-1">Team {player.team}</p>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-700">
                                  <img 
                                    src={player.avatar} 
                                    alt={player.username}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <p className="text-sm truncate">
                                  {player.username}
                                  {player.username === battle.winnerId && (
                                    <span className="ml-1 text-yellow-500">👑</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Cases</p>
                            <p className="text-sm font-medium">{battle.cases} items</p>
                          </div>
                          
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                            onClick={() => handleViewBattle(battle)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                
                {battles.filter(b => b.status === 'completed').length === 0 && (
                  <div className="col-span-3 text-center py-10">
                    <Trophy className="mx-auto h-10 w-10 text-gray-500 mb-2" />
                    <p className="text-gray-500">No battle history yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CaseBattles;
