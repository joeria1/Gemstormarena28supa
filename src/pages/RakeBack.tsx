
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useUser } from '../context/UserContext';
import { playSound } from '../utils/soundEffects';
import { SOUNDS } from '../utils/soundEffects';
import { showGameResult } from '../components/GameResultNotification';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Timer, TrendingUp, Award } from 'lucide-react';

interface RakeBackTable {
  id: string;
  name: string;
  minBet: number;
  maxBet: number;
  players: Player[];
  maxPlayers: number;
  startCountdown: number | null;
  status: 'waiting' | 'starting' | 'in-progress' | 'completed';
  rakebackPercentage: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  bet: number;
}

const RakeBack: React.FC = () => {
  const { user } = useUser();
  const [tables, setTables] = useState<RakeBackTable[]>([]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  // Generate initial tables
  useEffect(() => {
    const initialTables: RakeBackTable[] = [
      {
        id: 'table-1',
        name: 'Bronze Table',
        minBet: 10,
        maxBet: 100,
        players: [],
        maxPlayers: 4,
        startCountdown: null,
        status: 'waiting',
        rakebackPercentage: 5
      },
      {
        id: 'table-2',
        name: 'Silver Table',
        minBet: 100,
        maxBet: 500,
        players: [],
        maxPlayers: 4,
        startCountdown: null,
        status: 'waiting',
        rakebackPercentage: 10
      },
      {
        id: 'table-3',
        name: 'Gold Table',
        minBet: 500,
        maxBet: 1000,
        players: [],
        maxPlayers: 4,
        startCountdown: null,
        status: 'waiting',
        rakebackPercentage: 15
      },
      {
        id: 'table-4',
        name: 'Diamond Table',
        minBet: 1000,
        maxBet: 5000,
        players: [],
        maxPlayers: 4,
        startCountdown: null,
        status: 'waiting',
        rakebackPercentage: 20
      }
    ];
    
    setTables(initialTables);
  }, []);
  
  // Join table function
  const joinTable = (tableId: string) => {
    if (!user) return;
    
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          // Check if user already joined this table
          if (table.players.some(p => p.id === user.id)) {
            return table;
          }
          
          // Check if bet amount is valid for this table
          if (betAmount < table.minBet || betAmount > table.maxBet) {
            return table;
          }
          
          // Add user to table players
          const updatedPlayers = [
            ...table.players,
            {
              id: user.id,
              name: user.username,
              avatar: user.avatar,
              bet: betAmount
            }
          ];
          
          playSound(SOUNDS.RAKE_JOIN);
          
          // Start countdown if first player joined
          let countdown = table.startCountdown;
          if (updatedPlayers.length === 1) {
            countdown = 10; // 10 seconds countdown
          }
          
          return {
            ...table,
            players: updatedPlayers,
            startCountdown: countdown
          };
        }
        return table;
      });
    });
    
    // Select this table to show details
    setSelectedTable(tableId);
  };
  
  // Handle countdown and game progression
  useEffect(() => {
    const timerId = setInterval(() => {
      setTables(prevTables => {
        let tablesChanged = false;
        
        const updatedTables = prevTables.map(table => {
          // Skip tables that are not in countdown or already in progress
          if (table.startCountdown === null || table.status === 'in-progress' || table.status === 'completed') {
            return table;
          }
          
          // Decrease countdown
          const newCountdown = table.startCountdown - 1;
          
          // If countdown reaches 0, start the game
          if (newCountdown <= 0) {
            tablesChanged = true;
            // Play start sound
            playSound(SOUNDS.RAKE_START);
            
            // Start the game immediately
            return {
              ...table,
              startCountdown: null,
              status: 'in-progress'
            };
          }
          
          // Just update countdown
          return {
            ...table,
            startCountdown: newCountdown
          };
        });
        
        return updatedTables;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, []);
  
  // Process games that are in progress
  useEffect(() => {
    const gameProcessorId = setInterval(() => {
      setTables(prevTables => {
        let tablesChanged = false;
        
        const updatedTables = prevTables.map(table => {
          // Only process tables that are in progress
          if (table.status !== 'in-progress') {
            return table;
          }
          
          tablesChanged = true;
          
          // Process game completion
          const totalBets = table.players.reduce((sum, player) => sum + player.bet, 0);
          const rake = totalBets * (table.rakebackPercentage / 100);
          
          // If user is in this game, show result
          if (user && table.players.some(p => p.id === user.id)) {
            const userPlayer = table.players.find(p => p.id === user.id);
            if (userPlayer) {
              const userRake = userPlayer.bet * (table.rakebackPercentage / 100);
              
              playSound(SOUNDS.RAKE_WIN);
              showGameResult({
                success: true,
                message: `Rakeback: ${table.rakebackPercentage}%`,
                multiplier: 1 + (table.rakebackPercentage / 100),
                amount: userRake
              });
              
              // Update user balance (this would usually happen on the backend)
              if (user.updateBalance) {
                user.updateBalance(userRake);
              }
            }
          }
          
          // Reset the table for new players
          return {
            ...table,
            players: [],
            status: 'waiting',
            startCountdown: null
          };
        });
        
        return tablesChanged ? updatedTables : prevTables;
      });
    }, 5000); // Process games every 5 seconds
    
    return () => clearInterval(gameProcessorId);
  }, [user]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">RakeBack Tables</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Available Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table</TableHead>
                    <TableHead>Min/Max Bet</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Rakeback %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map(table => (
                    <TableRow key={table.id} className={selectedTable === table.id ? 'bg-primary/5' : ''}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>{table.minBet} - {table.maxBet}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span>{table.players.length}/{table.maxPlayers}</span>
                        </div>
                      </TableCell>
                      <TableCell>{table.rakebackPercentage}%</TableCell>
                      <TableCell>
                        {table.status === 'waiting' && table.startCountdown === null && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">Waiting</Badge>
                        )}
                        {table.startCountdown !== null && (
                          <Badge className="bg-yellow-500">Starting in {table.startCountdown}s</Badge>
                        )}
                        {table.status === 'in-progress' && (
                          <Badge className="bg-green-500 animate-pulse">In Progress</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          onClick={() => joinTable(table.id)}
                          disabled={
                            !user || 
                            table.players.length >= table.maxPlayers || 
                            table.players.some(p => p.id === user?.id) ||
                            betAmount < table.minBet ||
                            betAmount > table.maxBet ||
                            table.status === 'in-progress'
                          }
                          className="bg-primary"
                        >
                          Join
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Bet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Bet Amount</label>
                  <div className="flex space-x-2">
                    <input 
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      min="10"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Rakeback Info
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="bg-black/20 p-2 rounded">
                      Rakeback is a percentage of your bet that is returned to you as a reward.
                    </p>
                    <p>• Bronze Table: 5% rakeback</p>
                    <p>• Silver Table: 10% rakeback</p>
                    <p>• Gold Table: 15% rakeback</p>
                    <p>• Diamond Table: 20% rakeback</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedTable && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Table Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tables.find(t => t.id === selectedTable)?.players.map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-black/20 rounded-md">
                      <div className="flex items-center gap-2">
                        <img 
                          src={player.avatar} 
                          alt={player.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <span>{player.name}</span>
                      </div>
                      <div>
                        <span className="font-mono">{player.bet}</span>
                      </div>
                    </div>
                  ))}
                  
                  {tables.find(t => t.id === selectedTable)?.players.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No players have joined this table yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RakeBack;
