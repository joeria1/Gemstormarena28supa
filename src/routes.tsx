// This file is no longer used since routing is handled directly in App.tsx
// Keeping this file for reference only
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Blackjack from './pages/Blackjack';
import CaseBattles from './pages/CaseBattles';
import Cases from './pages/Cases';
import Crash from './pages/Crash';
import Mines from './pages/Mines';
import NotFound from './pages/NotFound';
import RakeBack from './pages/RakeBack';
import Rewards from './pages/Rewards';
import Tower from './pages/Tower';
import HorseRacing from './pages/HorseRacing';
import Affiliates from './pages/Affiliates';

// NOTE: This component is not used anymore, as routing is now directly handled in App.tsx
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/blackjack" element={<Blackjack />} />
      <Route path="/case-battles" element={<CaseBattles />} />
      <Route path="/cases" element={<Cases />} />
      <Route path="/crash" element={<Crash />} />
      <Route path="/mines" element={<Mines />} />
      <Route path="/rake-back" element={<RakeBack />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/tower" element={<Tower />} />
      <Route path="/horse-racing" element={<HorseRacing />} />
      <Route path="/affiliates" element={<Affiliates />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
