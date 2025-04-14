
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import ProfileHeader from '../components/Profile/ProfileHeader';
import LevelRewards from '../components/Profile/LevelRewards';
import AffiliateForm from '../components/Profile/AffiliateForm';
import FullProfileModal from '../components/Profile/FullProfileModal';

const EnhancedProfile = () => {
  const [showFullProfile, setShowFullProfile] = useState(false);
  
  // Mock user data
  const userData = {
    username: "CryptoPlayer",
    avatarUrl: "",
    level: 5,
    xp: 435,
    joinDate: "2024-01-15",
    totalWagered: 12500,
    totalWon: 15800,
    referrals: 7,
    rank: "Gold",
    winRate: 52,
    achievements: 8,
    recentActivity: [
      { id: 1, date: "2025-04-14", type: "Bet", game: "Blackjack", outcome: 'win' as const, amount: 250 },
      { id: 2, date: "2025-04-13", type: "Bet", game: "Mines", outcome: 'loss' as const, amount: 100 },
      { id: 3, date: "2025-04-13", type: "Bet", game: "Crash", outcome: 'win' as const, amount: 500 },
      { id: 4, date: "2025-04-12", type: "Bet", game: "Horse Racing", outcome: 'loss' as const, amount: 75 },
      { id: 5, date: "2025-04-11", type: "Bet", game: "Case Battle", outcome: 'win' as const, amount: 300 },
    ],
    stats: {
      gamesPlayed: 143,
      highestWin: 1200,
      favoriteGame: "Crash",
    },
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-6xl mx-auto px-4 py-8"
    >
      <ProfileHeader 
        username={userData.username}
        avatarUrl={userData.avatarUrl}
        level={userData.level}
        xp={userData.xp}
        joinDate={userData.joinDate}
        totalWagered={userData.totalWagered}
        onViewFullProfile={() => setShowFullProfile(true)}
      />
      
      <div className="mt-8">
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="rewards">Level Rewards</TabsTrigger>
            <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
          </TabsList>
          <TabsContent value="rewards">
            <LevelRewards currentLevel={userData.level} />
          </TabsContent>
          <TabsContent value="affiliate">
            <AffiliateForm referralCode="CRYPTOPLAYER" />
          </TabsContent>
        </Tabs>
      </div>
      
      <FullProfileModal 
        isOpen={showFullProfile}
        onClose={() => setShowFullProfile(false)}
        userData={userData}
      />
    </motion.div>
  );
};

export default EnhancedProfile;
