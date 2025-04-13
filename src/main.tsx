
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "./components/ui/theme-provider"
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { Toaster } from "@/components/ui/toaster"
import SoundManager from './components/SoundManager'
import { SoundProvider } from './components/ui/sound-context'
import { ChatProvider } from './context/ChatContext';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <BrowserRouter>
          <SoundProvider>
            <UserProvider>
              <ChatProvider>
                <App />
                <SoundManager />
                <Toaster />
              </ChatProvider>
            </UserProvider>
          </SoundProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
