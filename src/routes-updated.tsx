
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Cases from './pages/Cases';
import Crash from './pages/Crash';
import HorseRacing from './pages/HorseRacing';
import Mines from './pages/Mines';
import Blackjack from './pages/Blackjack';
import Tower from './pages/Tower';
import CaseBattles from './pages/CaseBattles';
import Profile from './pages/Profile';
import Affiliates from './pages/Affiliates';
import Rewards from './pages/Rewards';
import EnhancedHome from './pages/EnhancedHome';
import EnhancedProfile from './pages/EnhancedProfile';
import EnhancedGames from './pages/EnhancedGames';
import RakeBack from './pages/RakeBack';
import Plinko from './pages/Plinko';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/cases" element={<Cases />} />
      <Route path="/crash" element={<Crash />} />
      <Route path="/horse-racing" element={<HorseRacing />} />
      <Route path="/mines" element={<Mines />} />
      <Route path="/blackjack" element={<Blackjack />} />
      <Route path="/tower" element={<Tower />} />
      <Route path="/case-battles" element={<CaseBattles />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/affiliates" element={<Affiliates />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/enhanced-home" element={<EnhancedHome />} />
      <Route path="/enhanced-profile" element={<EnhancedProfile />} />
      <Route path="/enhanced-games" element={<EnhancedGames />} />
      <Route path="/rakeback" element={<RakeBack />} />
      <Route path="/plinko" element={<Plinko />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
