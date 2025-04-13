
import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Copy, Users, DollarSign, Heart, Gift, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const Affiliates = () => {
  const { user } = useContext(UserContext);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  
  const affiliateUrl = `https://dump.fun/ref/${user.username?.toLowerCase() || 'user'}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    toast.success('Affiliate link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSubmitCode = () => {
    if (!enteredCode.trim()) {
      toast.error('Please enter a valid affiliate code');
      return;
    }
    
    toast.success('Affiliate code applied successfully!');
    setEnteredCode('');
  };
  
  const handleCreateCode = () => {
    if (!code.trim()) {
      toast.error('Please enter a valid code');
      return;
    }
    
    toast.success(`Affiliate code "${code}" created successfully!`);
    setCode('');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-green-500 mr-2" />
          <h1 className="text-2xl font-bold">Affiliates Program</h1>
        </div>
        <div className="bg-gray-800 p-2 rounded-lg flex items-center">
          <DollarSign className="text-yellow-500 w-5 h-5 mr-1" />
          <span className="text-white font-bold">${user.balance.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-none shadow-lg text-white p-6">
            <h2 className="text-xl font-bold mb-4">Your Affiliate Link</h2>
            <div className="flex items-center mb-6">
              <Input 
                value={affiliateUrl}
                readOnly
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button 
                variant="outline" 
                className="ml-2 bg-gray-800 border-gray-700 hover:bg-gray-700"
                onClick={handleCopyLink}
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <Tabs defaultValue="benefits" className="w-full">
              <TabsList className="w-full bg-gray-800">
                <TabsTrigger className="flex-1" value="benefits">Benefits</TabsTrigger>
                <TabsTrigger className="flex-1" value="statistics">Statistics</TabsTrigger>
                <TabsTrigger className="flex-1" value="codes">Custom Codes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="benefits" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                      <h3 className="font-bold">Commission Rate</h3>
                    </div>
                    <p className="text-sm text-gray-400">Earn up to 40% commission on all wagers placed by your referrals.</p>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Gift className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-bold">Referral Bonuses</h3>
                    </div>
                    <p className="text-sm text-gray-400">Get $5 bonus for each new user that signs up with your code.</p>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Heart className="h-5 w-5 text-red-500 mr-2" />
                      <h3 className="font-bold">Loyalty Rewards</h3>
                    </div>
                    <p className="text-sm text-gray-400">Earn extra rewards based on your referrals' activity.</p>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-yellow-500 mr-2" />
                      <h3 className="font-bold">Tiered System</h3>
                    </div>
                    <p className="text-sm text-gray-400">Unlock higher commission rates as you refer more users.</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="statistics" className="mt-4">
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Total Referrals</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Active Referrals</p>
                      <p className="text-xl font-bold">0</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Earned</p>
                      <p className="text-xl font-bold text-green-500">$0.00</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pending Payout</p>
                      <p className="text-xl font-bold text-yellow-500">$0.00</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Recent Activity</h3>
                  <div className="text-center text-gray-400 py-8">
                    No referral activity yet. Share your link to start earning!
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="codes" className="mt-4">
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="font-bold mb-2">Create Custom Code</h3>
                  <div className="flex items-center">
                    <Input 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter custom code"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button 
                      className="ml-2 bg-green-600 hover:bg-green-700"
                      onClick={handleCreateCode}
                    >
                      Create
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Your Custom Codes</h3>
                  <div className="text-center text-gray-400 py-8">
                    You haven't created any custom codes yet.
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        <div>
          <Card className="bg-gray-900 border-none shadow-lg text-white p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Enter Affiliate Code</h2>
            <div className="mb-4">
              <Input 
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                placeholder="Enter code"
                className="bg-gray-800 border-gray-700 text-white mb-2"
              />
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleSubmitCode}
              >
                Submit Code
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Enter an affiliate code to support a creator and receive a one-time $0.50 bonus.
            </p>
          </Card>
          
          <Card className="bg-gray-900 border-none shadow-lg text-white p-6">
            <h2 className="text-xl font-bold mb-4">Affiliate FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-green-500">How do referrals work?</h3>
                <p className="text-sm text-gray-400">
                  Share your unique link or code with friends. When they sign up and play, you earn commissions.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-green-500">When do I get paid?</h3>
                <p className="text-sm text-gray-400">
                  Commissions are added to your balance automatically once they reach $10.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-green-500">What's the commission rate?</h3>
                <p className="text-sm text-gray-400">
                  You earn 5% of your referrals' wager amount. This can increase up to 40% based on your tier level.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Affiliates;
