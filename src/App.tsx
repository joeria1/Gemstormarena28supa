import React, { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blackjack from './pages/Blackjack';
import CaseBattles from './pages/CaseBattles';
import Cases from './pages/Cases';
import Crash from './pages/Crash';
import Mines from './pages/Mines';
import Affiliates from './pages/Affiliates';
import HorseRacing from './pages/HorseRacing';
import { UserProvider } from './context/UserContext';
import { Toaster } from 'sonner';
import Rewards from './pages/Rewards';

const App = () => {
  const [theme, setTheme] = useState('dark');

  return (
    <BrowserRouter>
      <UserProvider>
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blackjack" element={<Blackjack />} />
          <Route path="/case-battles" element={<CaseBattles />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/crash" element={<Crash />} />
          <Route path="/mines" element={<Mines />} />
          <Route path="/affiliates" element={<Affiliates />} />
          <Route path="/horse-racing" element={<HorseRacing />} />
        
        <Route path="/rewards" element={<Rewards />} />
        
        </Routes>
      
      <Toaster richColors closeButton />
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
