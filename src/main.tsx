
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from "./components/ui/theme-provider";
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { Toaster } from "@/components/ui/toaster";
import { SoundProvider } from './components/ui/sound-context';
import { ChatProvider } from './context/ChatContext';

// Prevent automatic scrolling to bottom
if (typeof window !== 'undefined') {
  const originalScrollRestoration = window.history.scrollRestoration;
  if (originalScrollRestoration) {
    window.history.scrollRestoration = 'manual';
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <BrowserRouter>
        <SoundProvider>
          <UserProvider>
            <ChatProvider>
              <App />
              <Toaster />
            </ChatProvider>
          </UserProvider>
        </SoundProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
