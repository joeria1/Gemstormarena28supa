
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EnhancedHome from './pages/EnhancedHome';
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
import NotFound from './pages/NotFound';
import Tower from './pages/Tower';
import RakeBack from './pages/RakeBack';
import { ChatProvider } from './context/ChatContext';
import ChatContainer from './components/Chat/ChatContainer';
import ChatToggle from './components/Chat/ChatToggle';
import Profile from './pages/Profile';
import LightningEffect from './components/GameEffects/LightningEffect';
import { useState as useStateImported } from 'react';

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [showCaseBattleLightning, setShowCaseBattleLightning] = useState(false);

  // Randomly show lightning effects for case battles
  React.useEffect(() => {
    const lightningInterval = setInterval(() => {
      const path = window.location.pathname;
      // Only show lightning effects on case battles page
      if (path.includes('case-battles')) {
        const shouldShowLightning = Math.random() > 0.8; // 20% chance
        if (shouldShowLightning) {
          setShowCaseBattleLightning(true);
          setTimeout(() => setShowCaseBattleLightning(false), 2000);
        }
      }
    }, 10000);
    
    return () => clearInterval(lightningInterval);
  }, []);

  return (
    <BrowserRouter>
      <UserProvider>
        <ChatProvider>
          <Navbar />
          
          <Routes>
            <Route path="/" element={<EnhancedHome />} />
            <Route path="/home-old" element={<Home />} />
            <Route path="/blackjack" element={<Blackjack />} />
            <Route path="/case-battles" element={<CaseBattles />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/crash" element={<Crash />} />
            <Route path="/mines" element={<Mines />} />
            <Route path="/affiliates" element={<Affiliates />} />
            <Route path="/horse-racing" element={<HorseRacing />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tower" element={<Tower />} />
            <Route path="/rake-back" element={<RakeBack />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <ChatContainer />
          <ChatToggle />
          <Toaster richColors closeButton />
          
          {/* Lightning effect for case battles */}
          <LightningEffect 
            isVisible={showCaseBattleLightning} 
            onComplete={() => setShowCaseBattleLightning(false)} 
          />
        </ChatProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
