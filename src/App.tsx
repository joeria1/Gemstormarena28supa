
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';

import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './components/ui/theme-provider';
import ImprovedChatContainer from './components/Chat/ImprovedChatContainer';
import { UserProvider } from './context/UserContext';
import { ChatProvider } from './context/ChatContext';
import SoundManager from './components/SoundManager';
import AppRoutes from './routes';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ChatProvider>
          <SoundManager />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-900 text-white">
              <AppRoutes />
            </main>
            <Footer />
            <ImprovedChatContainer />
            <Toaster position="top-right" />
          </div>
        </ChatProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
