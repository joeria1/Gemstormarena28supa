
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import Cases from './pages/Cases';
import Mines from './pages/Mines';
import Blackjack from './pages/Blackjack';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SoundManager from './components/SoundManager';
import ChatContainer from './components/Chat/ChatContainer';
import DepositButton from './components/DepositButton';
import Tower from './pages/Tower';
import Rewards from './pages/Rewards';
import Crash from './pages/Crash';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 pt-16 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/mines" element={<Mines />} />
            <Route path="/blackjack" element={<Blackjack />} />
            <Route path="/tower" element={<Tower />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/crash" element={<Crash />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
        <ChatContainer />
        <div className="fixed top-16 right-4 z-30">
          <DepositButton />
        </div>
        <SoundManager />
      </div>
    </QueryClientProvider>
  );
}

export default App;
