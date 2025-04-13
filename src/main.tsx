import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from "./components/theme-provider"
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { Toaster } from "@/components/ui/toaster"
import SoundManager from './components/SoundManager'
import { ChatProvider } from './context/ChatContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>,
);
