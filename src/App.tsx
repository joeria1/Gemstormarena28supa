
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './components/ui/theme-provider';
import ChatToggle from './components/Chat/ChatToggle';
import ChatContainer from './components/Chat/ChatContainer';
import { UserProvider } from './context/UserContext';
import { ChatProvider } from './context/ChatContext';
import SoundManager from './components/SoundManager';

import Index from './pages/Index';
import Cases from './pages/Cases';
import Crash from './pages/Crash';
import Mines from './pages/Mines';
import Tower from './pages/Tower';
import Blackjack from './pages/Blackjack';
import RakeBack from './pages/RakeBack';
import Rewards from './pages/Rewards';
import CaseBattles from './pages/CaseBattles';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ChatProvider>
          <Router>
            <SoundManager />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/cases" element={<Cases />} />
                  <Route path="/case-battles" element={<CaseBattles />} />
                  <Route path="/crash" element={<Crash />} />
                  <Route path="/mines" element={<Mines />} />
                  <Route path="/tower" element={<Tower />} />
                  <Route path="/blackjack" element={<Blackjack />} />
                  <Route path="/rakeback" element={<RakeBack />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <ChatToggle />
            <ChatContainer />
            <Toaster position="top-right" />
          </Router>
        </ChatProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
